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
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      throw new Error("File và shop_id là bắt buộc.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    let headerRowIndex = -1;
    let createdTimeIndex = -1;
    let orderRefundAmountIndex = -1;

    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      const createdTime = row.indexOf("Created Time");
      const orderRefundAmount = row.indexOf("Order Refund Amount");

      if (createdTime !== -1 && orderRefundAmount !== -1) {
        headerRowIndex = i;
        createdTimeIndex = createdTime;
        orderRefundAmountIndex = orderRefundAmount;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Không tìm thấy cột 'Created Time' và 'Order Refund Amount' trong file Excel.");
    }

    const dataRows = json.slice(headerRowIndex + 1);
    const updates: { [date: string]: number } = {};

    for (const row of dataRows) {
      const createdTimeStr = row[createdTimeIndex];
      const refundAmountStr = row[orderRefundAmountIndex];

      if (!createdTimeStr || refundAmountStr === undefined || refundAmountStr === null) {
        continue;
      }

      const refundAmount = parseFloat(String(refundAmountStr).replace(/[^0-9.-]+/g, ""));
      if (isNaN(refundAmount)) {
        continue;
      }

      const dateParts = String(createdTimeStr).split(' ')[0].split('-');
      if (dateParts.length !== 3) continue;
      
      const reportDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      if (!updates[reportDate]) {
        updates[reportDate] = 0;
      }
      updates[reportDate] += refundAmount;
    }

    const updatePromises = Object.entries(updates).map(([date, totalCancelledRevenue]) => {
      return supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update({ cancelled_revenue: totalCancelledRevenue })
        .eq("shop_id", shopId)
        .eq("report_date", date);
    });

    const results = await Promise.all(updatePromises);
    const errors = results.filter(res => res.error);

    if (errors.length > 0) {
      console.error("Errors updating reports:", errors);
      throw new Error(`Có lỗi xảy ra khi cập nhật ${errors.length} báo cáo.`);
    }

    return new Response(JSON.stringify({ message: `Đã cập nhật thành công doanh thu hủy cho ${Object.keys(updates).length} ngày.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in upload-tiktok-cancelled-revenue function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});