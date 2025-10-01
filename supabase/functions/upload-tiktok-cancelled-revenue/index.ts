// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { read, utils } from "https://deno.land/x/sheetjs/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const findHeader = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const found = headers.find(h => h && h.toLowerCase().trim() === name.toLowerCase());
    if (found) return found;
  }
  return null;
};

const parseDate = (excelDate) => {
  if (!excelDate) return null;

  let date;
  if (excelDate instanceof Date) {
    date = excelDate;
  } else if (typeof excelDate === 'number' && excelDate > 1) {
    date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  } else if (typeof excelDate === 'string') {
    const datePart = excelDate.split(' ')[0];
    const parts = datePart.split(/[\/\-]/);
    if (parts.length === 3) {
      const part1 = parseInt(parts[0], 10);
      const part2 = parseInt(parts[1], 10);
      const part3 = parseInt(parts[2], 10);
      if (!isNaN(part1) && !isNaN(part2) && !isNaN(part3)) {
        // Assuming DD/MM/YYYY format
        if (part3 > 2000 && part2 <= 12 && part1 <= 31) {
          date = new Date(Date.UTC(part3, part2 - 1, part1));
        }
      }
    }
    if (!date || isNaN(date.getTime())) {
      date = new Date(excelDate);
    }
  }

  if (date && !isNaN(date.getTime())) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  }
  
  return null;
};

const parseCurrencyValue = (value) => {
    if (value === null || value === undefined) return null;
    const stringValue = String(value).trim();
    if (stringValue === '') return null;
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
    
    const allRows = utils.sheet_to_json(worksheet, { header: 1, defval: null });
    if (allRows.length < 3) {
      throw new Error("File Excel phải có ít nhất 3 dòng (2 dòng đầu cho header, dữ liệu từ dòng 3).");
    }
    
    const headers = allRows[1];
    const dataRows = allRows.slice(2);

    const dateHeader = findHeader(headers, ["Created Time", "Thời gian tạo"]);
    const refundAmountHeader = findHeader(headers, ["Order Refund Amount"]);
    
    if (!dateHeader || !refundAmountHeader) {
      throw new Error("File Excel phải chứa các cột 'Created Time' và 'Order Refund Amount'.");
    }
    
    const dateHeaderIndex = headers.indexOf(dateHeader);
    const refundAmountHeaderIndex = headers.indexOf(refundAmountHeader);

    const dailyRefunds = new Map();

    for (const row of dataRows) {
      const reportDate = parseDate(row[dateHeaderIndex]);
      const refundAmount = parseCurrencyValue(row[refundAmountHeaderIndex]);

      if (reportDate && refundAmount !== null) {
        const currentTotal = dailyRefunds.get(reportDate) || 0;
        dailyRefunds.set(reportDate, currentTotal + refundAmount);
      }
    }

    if (dailyRefunds.size === 0) {
      return new Response(
        JSON.stringify({ message: "Không có dữ liệu hoàn tiền hợp lệ để cập nhật." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updates = [];
    for (const [date, totalAmount] of dailyRefunds.entries()) {
      updates.push(
        supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .update({ returned_revenue: totalAmount })
          .eq("shop_id", shopId)
          .eq("report_date", date)
      );
    }

    const results = await Promise.all(updates);
    
    let successfulUpdates = 0;
    results.forEach(res => {
      if (!res.error && res.count > 0) {
        successfulUpdates += res.count;
      }
    });

    if (successfulUpdates === 0) {
        return new Response(
            JSON.stringify({ message: "Không có báo cáo nào được tìm thấy để cập nhật cho các ngày đã cung cấp." }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ message: `Đã cập nhật thành công doanh thu hoàn lại cho ${dailyRefunds.size} ngày.` }),
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