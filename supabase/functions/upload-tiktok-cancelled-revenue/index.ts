// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

    // Auth check
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("Shop ID and file are required.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    if (data.length < 3) {
      throw new Error("File must contain at least a header row and one data row.");
    }

    const headers = data[1].map(h => String(h || '').trim().toLowerCase());
    const amountHeaderOptions = ["order refund amount", "tổng số tiền", "order total refund amount of all returned skus."];
    const dateHeaderOptions = ["created time", "thời gian huỷ", "the time when the order status changes to cancelled."];

    const amountIndex = headers.findIndex(h => amountHeaderOptions.includes(h));
    const dateIndex = headers.findIndex(h => dateHeaderOptions.includes(h));

    if (amountIndex === -1 || dateIndex === -1) {
      const missing = [];
      if (amountIndex === -1) missing.push(`'Order Refund Amount' or 'Tổng số tiền' or 'order total refund amount of all returned skus.'`);
      if (dateIndex === -1) missing.push(`'Created Time' or 'Thời gian huỷ' or 'the time when the order status changes to cancelled.'`);
      throw new Error(`Required columns ${missing.join(' and ')} not found on the second row. Found headers: [${headers.join(', ')}]`);
    }

    const revenueByDate: { [key: string]: number } = {};
    const dataRows = data.slice(2);
    const totalRows = dataRows.length;
    let processedRows = 0;
    const skippedRows: { row: number; reason: string }[] = [];

    for (const [index, row] of dataRows.entries()) {
      const dateValue = row[dateIndex];
      const amountValue = row[amountIndex];

      if (!dateValue || !amountValue) {
        skippedRows.push({ row: index + 3, reason: "Thiếu dữ liệu ngày hoặc số tiền." });
        continue;
      }

      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          skippedRows.push({ row: index + 3, reason: `Định dạng ngày không hợp lệ: '${dateValue}'` });
          continue;
        }

        const formattedDate = formatDate(date);
        const amount = parseFloat(String(amountValue).replace(/[^0-9.-]+/g,""));

        if (isNaN(amount)) {
          skippedRows.push({ row: index + 3, reason: `Định dạng số tiền không hợp lệ: '${amountValue}'` });
          continue;
        }
        
        revenueByDate[formattedDate] = (revenueByDate[formattedDate] || 0) + amount;
        processedRows++;
      } catch (e) {
        skippedRows.push({ row: index + 3, reason: `Lỗi xử lý dòng: ${e.message}` });
      }
    }

    let updatedCount = 0;
    for (const [date, totalCancelledRevenue] of Object.entries(revenueByDate)) {
      const { data: existingReport, error: fetchError } = await supabaseAdmin
        .from('tiktok_comprehensive_reports')
        .select('id')
        .eq('shop_id', shop_id)
        .eq('report_date', date)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingReport && existingReport.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .update({ cancelled_revenue: totalCancelledRevenue, updated_at: new Date().toISOString() })
          .eq('shop_id', shop_id)
          .eq('report_date', date);
        
        if (updateError) throw updateError;
        updatedCount++;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .insert({
            shop_id,
            report_date: date,
            cancelled_revenue: totalCancelledRevenue,
          });
        
        if (insertError) throw insertError;
        updatedCount++;
      }
    }

    const message = `Cập nhật thành công ${updatedCount} bản ghi doanh số hủy. Đã xử lý ${processedRows}/${totalRows} dòng.`;
    const responsePayload = { 
        message,
        totalRows,
        processedRows,
        skippedCount: skippedRows.length,
        skippedDetails: skippedRows.slice(0, 10) // Trả về 10 lỗi đầu tiên để xem trước
    };

    return new Response(
      JSON.stringify(responsePayload),
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