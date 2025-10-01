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
    const workbook = read(new Uint8Array(buffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const allRows = utils.sheet_to_json(worksheet, { header: 1 });
    if (allRows.length < 3) {
      throw new Error("File Excel phải có ít nhất 3 dòng (2 dòng đầu cho header, dữ liệu từ dòng 3).");
    }
    
    const headers = allRows[1]; // Headers are on the second row
    const dataRows = allRows.slice(2); // Data from row 3 onwards

    const refundAmountHeader = findHeader(headers, ["Order Refund Amount"]);
    
    if (!refundAmountHeader) {
      throw new Error("File Excel phải chứa cột 'Order Refund Amount'.");
    }
    
    const refundAmountHeaderIndex = headers.indexOf(refundAmountHeader);

    let totalAmount = 0;
    for (const row of dataRows) {
      const value = parseCurrencyValue(row[refundAmountHeaderIndex]);
      if (value !== null) {
        totalAmount += value;
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: reports, error: fetchError } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .select("id, report_date")
      .eq("shop_id", shopId)
      .gte("report_date", startDate)
      .lte("report_date", endDate)
      .order("report_date", { ascending: true });

    if (fetchError) throw fetchError;

    if (!reports || reports.length === 0) {
      return new Response(
        JSON.stringify({ message: `Không tìm thấy báo cáo nào cho shop trong tháng ${month}/${year}. Vui lòng upload báo cáo chính trước.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstReportId = reports[0].id;
    const otherReportIds = reports.slice(1).map(r => r.id);

    const updates = [];
    const updatePayload = { returned_revenue: totalAmount };

    updates.push(
      supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update(updatePayload)
        .eq("id", firstReportId)
    );

    if (otherReportIds.length > 0) {
      updates.push(
        supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .update({ returned_revenue: 0 })
          .in("id", otherReportIds)
      );
    }

    const results = await Promise.all(updates);
    const firstError = results.find(r => r.error);

    if (firstError) {
      throw firstError.error;
    }

    return new Response(
      JSON.stringify({ message: `Đã cập nhật thành công tổng doanh thu hoàn lại là ${totalAmount.toLocaleString('vi-VN')}₫ cho tháng ${month}/${year}.` }),
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