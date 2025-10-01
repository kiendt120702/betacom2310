// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to parse currency values which might be strings with commas
const parseCurrency = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const strValue = String(value).replace(/[^0-9.-]+/g, "");
  if (strValue === "") return null;
  const num = parseFloat(strValue);
  return isNaN(num) ? null : num;
};

// Helper to parse percentage values
const parsePercentage = (value: any): number | null => {
    if (typeof value === 'number') return value * 100;
    if (typeof value !== 'string') return null;
    const num = parseFloat(value.replace('%', '').trim());
    return isNaN(num) ? null : num;
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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("Shop ID and file are required.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

    let dataStartIndex = -1;
    for (let i = 0; i < rawJson.length; i++) {
      if (rawJson[i][0] === 'Dữ liệu theo ngày') {
        dataStartIndex = i + 1;
        break;
      }
    }

    if (dataStartIndex === -1) {
      dataStartIndex = rawJson.findIndex(row => row[0] instanceof Date || (typeof row[0] === 'string' && row[0].match(/^\d{4}-\d{2}-\d{2}/)));
      if (dataStartIndex === -1) {
        throw new Error("Could not find the start of the data. Make sure the header 'Dữ liệu theo ngày' exists.");
      }
    }
    
    const dataRows = rawJson.slice(dataStartIndex);

    const reportsToUpsert = [];
    const skippedDetails = [];
    let processedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = dataStartIndex + i + 1;

      if (!row[0]) {
        skippedDetails.push({ row: rowNum, reason: "Empty date column." });
        continue;
      }

      let report_date: Date;
      if (row[0] instanceof Date) {
        report_date = row[0];
      } else {
        report_date = new Date(row[0]);
        if (isNaN(report_date.getTime())) {
          skippedDetails.push({ row: rowNum, reason: `Invalid date format: ${row[0]}` });
          continue;
        }
      }
      
      report_date.setMinutes(report_date.getMinutes() - report_date.getTimezoneOffset());
      const formattedDate = report_date.toISOString().split('T')[0];

      const report = {
        shop_id,
        report_date: formattedDate,
        total_revenue: parseCurrency(row[1]),
        returned_revenue: parseCurrency(row[2]),
        platform_subsidized_revenue: parseCurrency(row[3]),
        items_sold: parseCurrency(row[4]),
        total_buyers: parseCurrency(row[5]),
        total_visits: parseCurrency(row[6]),
        store_visits: parseCurrency(row[7]),
        sku_orders: parseCurrency(row[8]),
        total_orders: parseCurrency(row[9]),
        conversion_rate: parsePercentage(row[10]),
      };

      reportsToUpsert.push(report);
      processedCount++;
    }

    if (reportsToUpsert.length > 0) {
      const { error } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToUpsert, { onConflict: "shop_id, report_date" });

      if (error) {
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Successfully processed ${processedCount} rows. Skipped ${skippedDetails.length} rows.`,
        totalRows: dataRows.length,
        processedRows: processedCount,
        skippedCount: skippedDetails.length,
        skippedDetails: skippedDetails.slice(0, 20),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});