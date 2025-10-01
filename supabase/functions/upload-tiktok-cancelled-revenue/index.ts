// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { read, utils } from "https://deno.land/x/sheetjs/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to find a column header regardless of case and slight variations
const findHeader = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const found = headers.find(h => h.toLowerCase().trim() === name.toLowerCase());
    if (found) return found;
  }
  return null;
};

// Function to parse Excel dates (which can be numbers, strings, or Date objects)
const parseDate = (excelDate) => {
  if (!excelDate) return null;

  let date;
  // Check if it's an Excel serial date number
  if (typeof excelDate === 'number' && excelDate > 1) {
    date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  } 
  // Check if it's a date object (from cellDates: true)
  else if (excelDate instanceof Date) {
    date = excelDate;
  }
  // Check if it's a string that can be parsed
  else if (typeof excelDate === 'string') {
    // Handle "DD/MM/YYYY" or "MM/DD/YYYY"
    const parts = excelDate.split(/[\/\-]/);
    if (parts.length === 3) {
      const part1 = parseInt(parts[0], 10);
      const part2 = parseInt(parts[1], 10);
      const part3 = parseInt(parts[2], 10);
      if (!isNaN(part1) && !isNaN(part2) && !isNaN(part3)) {
        // Assuming DD/MM/YYYY format common in Vietnam
        if (part3 > 2000 && part2 <= 12 && part1 <= 31) {
          date = new Date(Date.UTC(part3, part2 - 1, part1));
        }
      }
    }
    if (!date || isNaN(date.getTime())) {
      date = new Date(excelDate); // Fallback to default parser
    }
  }

  if (date && !isNaN(date.getTime())) {
    // Adjust for timezone offset to get correct YYYY-MM-DD in UTC
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  }
  
  return null;
};

const parseCurrencyValue = (value) => {
    if (value === null || value === undefined) return null;
    const stringValue = String(value).trim();
    if (stringValue === '') return null;
    // Remove currency symbols, thousands separators, and treat comma as decimal separator
    const numericString = stringValue.replace(/[^0-9.,-]+/g, '').replace(/\./g, '').replace(/,/g, '.');
    const number = parseFloat(numericString);
    return isNaN(number) ? null : number;
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const formData = await req.formData();
    const file = formData.get("file");
    const shopId = formData.get("shop_id");

    if (!file || !shopId) {
      throw new Error("File và shop ID là bắt buộc.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(worksheet, { raw: false, defval: null });

    if (jsonData.length === 0) {
      return new Response(
        JSON.stringify({ message: "Không có dữ liệu trong file Excel." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
    const dateHeader = findHeader(headers, ["Ngày", "Date"]);
    const cancelledRevenueHeader = findHeader(headers, ["Doanh thu đơn hủy", "Cancelled Revenue", "Doanh số hủy"]);
    const cancelledOrdersHeader = findHeader(headers, ["Đơn Hủy", "Cancelled Orders"]);

    if (!dateHeader || !cancelledRevenueHeader) {
      throw new Error("File Excel phải chứa các cột 'Ngày' và 'Doanh thu đơn hủy'.");
    }

    const updates = [];
    for (const row of jsonData) {
      const reportDate = parseDate(row[dateHeader]);
      const cancelledRevenue = parseCurrencyValue(row[cancelledRevenueHeader]);
      const cancelledOrders = cancelledOrdersHeader ? parseInt(String(row[cancelledOrdersHeader]).replace(/[^0-9]+/g, ""), 10) : null;

      if (reportDate && cancelledRevenue !== null) {
        const updatePayload = {
          cancelled_revenue: cancelledRevenue,
        };
        if (cancelledOrdersHeader && cancelledOrders !== null && !isNaN(cancelledOrders)) {
          updatePayload.cancelled_orders = cancelledOrders;
        }
        
        updates.push(
          supabaseAdmin
            .from("tiktok_comprehensive_reports")
            .update(updatePayload)
            .eq("shop_id", shopId)
            .eq("report_date", reportDate)
        );
      }
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ message: "Không có dữ liệu doanh thu hủy hợp lệ để cập nhật." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.all(updates);
    
    const successfulOperations = results.filter(r => !r.error).length;

    if (successfulOperations === 0) {
        return new Response(
            JSON.stringify({ message: "Không có báo cáo nào được tìm thấy để cập nhật cho các ngày đã cung cấp." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ message: `Đã cập nhật thành công doanh thu hủy cho ${successfulOperations} ngày.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error in function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});