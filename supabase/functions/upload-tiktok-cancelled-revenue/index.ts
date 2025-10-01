// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as xlsx from "https://deno.land/x/deno_xlsx/mod.ts";

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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

    const workbook = xlsx.read(await fileData.arrayBuffer(), { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [],
      message: "",
    };

    if (jsonData.length === 0) {
      throw new Error("No data found in the Excel file.");
    }

    // Find date and revenue columns
    const headers = Object.keys(jsonData[0] || {});
    const dateColumnOptions = ["Ngày", "Thời gian hủy", "Order created time", "Order paid time"];
    const revenueColumnOptions = ["Payment Amount", "Giá trị đơn hàng"];

    const dateColumn = headers.find(h => dateColumnOptions.some(opt => h.trim() === opt));
    const revenueColumn = headers.find(h => revenueColumnOptions.some(opt => h.trim() === opt));

    if (!dateColumn) {
      throw new Error("Missing Date Column (e.g., 'Ngày', 'Thời gian hủy', 'Order created time')");
    }
    if (!revenueColumn) {
      throw new Error("Missing Revenue Column (e.g., 'Payment Amount')");
    }

    const updatesByDate = {};

    jsonData.forEach((row, index) => {
      const dateValue = row[dateColumn];
      const revenueValueStr = String(row[revenueColumn] || '0');
      const revenueValue = parseFloat(revenueValueStr.replace(/[^0-9.-]+/g,""));

      if (!dateValue || isNaN(revenueValue)) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: "Invalid date or revenue value" });
        return;
      }

      let reportDate;
      try {
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) throw new Error("Invalid date");
        reportDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } catch (e) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: `Invalid date format: ${dateValue}` });
        return;
      }

      if (!updatesByDate[reportDate]) {
        updatesByDate[reportDate] = { cancelled_revenue: 0, cancelled_orders: 0 };
      }
      updatesByDate[reportDate].cancelled_revenue += revenueValue;
      updatesByDate[reportDate].cancelled_orders += 1;
    });

    // Apply updates to the database
    for (const date in updatesByDate) {
      const update = updatesByDate[date];

      const { data: existingReport, error: fetchError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .select("id, cancelled_revenue, cancelled_orders")
        .eq("shop_id", shop_id)
        .eq("report_date", date)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingReport) {
        // Update existing report
        const { error: updateError } = await supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .update({
            cancelled_revenue: (existingReport.cancelled_revenue || 0) + update.cancelled_revenue,
            cancelled_orders: (existingReport.cancelled_orders || 0) + update.cancelled_orders,
          })
          .eq("id", existingReport.id);
        if (updateError) throw updateError;
      } else {
        // Insert new report for that day
        const { error: insertError } = await supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .insert({
            shop_id,
            report_date: date,
            cancelled_revenue: update.cancelled_revenue,
            cancelled_orders: update.cancelled_orders,
          });
        if (insertError) throw insertError;
      }
      results.processedRows += update.cancelled_orders;
    }

    // Clean up uploaded file
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    results.message = `Successfully processed ${results.processedRows} of ${results.totalRows} rows.`;

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});