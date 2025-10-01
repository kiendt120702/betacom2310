// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as xlsx from "https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { filePath, shop_id } = await req.json();
    if (!filePath || !shop_id) {
      throw new Error("filePath and shop_id are required.");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);

    if (downloadError) throw downloadError;

    const workbook = xlsx.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    if (jsonData.length === 0) {
      return new Response(JSON.stringify({ 
        message: "File rỗng hoặc không có dữ liệu.",
        totalRows: 0,
        processedRows: 0,
        skippedCount: 0,
        skippedDetails: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
      message: "",
    };

    const updatesByDate: { [date: string]: { cancelled_revenue: number; cancelled_orders: number } } = {};

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 2;

      const dateValue = row["Created Time"];
      const amountValue = row["Order Refund Amount"];

      if (dateValue === undefined || dateValue === null) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: "Thiếu cột 'Created Time'." });
        continue;
      }

      if (amountValue === undefined || amountValue === null) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: "Thiếu cột 'Order Refund Amount'." });
        continue;
      }

      let reportDateStr: string;
      try {
        let dateObj: Date;
        if (dateValue instanceof Date) {
            dateObj = dateValue;
        } else {
            const parts = String(dateValue).split(' ')[0].split('/');
            if (parts.length !== 3) throw new Error("Invalid date format");
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
        
        if (isNaN(dateObj.getTime())) {
            throw new Error("Invalid date value after parsing");
        }
        reportDateStr = dateObj.toISOString().split('T')[0];
      } catch (e) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: `Định dạng ngày không hợp lệ cho 'Created Time': ${dateValue}` });
        continue;
      }

      const amount = parseFloat(String(amountValue));
      if (isNaN(amount)) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: `Giá trị không hợp lệ cho 'Order Refund Amount': ${amountValue}` });
        continue;
      }

      if (!updatesByDate[reportDateStr]) {
        updatesByDate[reportDateStr] = { cancelled_revenue: 0, cancelled_orders: 0 };
      }
      updatesByDate[reportDateStr].cancelled_revenue += amount;
      updatesByDate[reportDateStr].cancelled_orders += 1;
    }

    for (const date in updatesByDate) {
      const update = updatesByDate[date];

      const { data: existingReport, error: fetchError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .select("id, cancelled_revenue, cancelled_orders")
        .eq("shop_id", shop_id)
        .eq("report_date", date)
        .maybeSingle();

      if (fetchError) {
        console.error(`Error fetching report for date ${date}:`, fetchError);
        continue;
      }

      if (existingReport) {
        const { error: updateError } = await supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .update({
            cancelled_revenue: (existingReport.cancelled_revenue || 0) + update.cancelled_revenue,
            cancelled_orders: (existingReport.cancelled_orders || 0) + update.cancelled_orders,
          })
          .eq("id", existingReport.id);
        if (updateError) console.error(`Error updating report for date ${date}:`, updateError);
        else results.processedRows += update.cancelled_orders;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .insert({
            shop_id,
            report_date: date,
            cancelled_revenue: update.cancelled_revenue,
            cancelled_orders: update.cancelled_orders,
          });
        if (insertError) console.error(`Error inserting report for date ${date}:`, insertError);
        else results.processedRows += update.cancelled_orders;
      }
    }

    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    results.message = `Đã xử lý thành công ${results.processedRows} trong tổng số ${results.totalRows} dòng.`;

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});