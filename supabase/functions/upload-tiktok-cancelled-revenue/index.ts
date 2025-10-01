// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const parseCurrency = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const strValue = String(value).replace(/[^0-9.-]+/g, "");
  if (strValue === "") return null;
  const num = parseFloat(strValue);
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

    // Find header row and column indices
    let headerRowIndex = -1;
    let dateColIndex = -1;
    let revenueColIndex = -1;

    for (let i = 0; i < rawJson.length; i++) {
        const row = rawJson[i];
        if (!Array.isArray(row)) continue;

        const lowerCaseRow = row.map(h => typeof h === 'string' ? h.trim().toLowerCase() : '');

        // Find column indices with more robust matching
        const dateIdx = lowerCaseRow.findIndex(h => h.includes('ngày hủy') || h === 'ngày');
        const revenueIdx = lowerCaseRow.findIndex(h => h.includes('doanh thu hủy') || h.includes('doanh số đơn hủy'));

        if (dateIdx !== -1 && revenueIdx !== -1) {
            headerRowIndex = i;
            dateColIndex = dateIdx;
            revenueColIndex = revenueIdx;
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error("Could not find header row with required columns ('Ngày hủy'/'Ngày' and 'Doanh thu hủy'/'Doanh số đơn hủy').");
    }

    const dataRows = rawJson.slice(headerRowIndex + 1);

    const updates = new Map<string, { cancelled_revenue: number, cancelled_orders: number }>();
    const skippedDetails = [];
    let processedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = headerRowIndex + i + 2;

      const dateValue = row[dateColIndex];
      const cancelledRevenueValue = row[revenueColIndex];

      if (!dateValue) {
        skippedDetails.push({ row: rowNum, reason: "Missing date value." });
        continue;
      }
      
      let report_date: Date;
      if (dateValue instanceof Date) {
        report_date = dateValue;
      } else {
        report_date = new Date(dateValue);
        if (isNaN(report_date.getTime())) {
          skippedDetails.push({ row: rowNum, reason: `Invalid date format: ${dateValue}` });
          continue;
        }
      }
      
      report_date.setMinutes(report_date.getMinutes() - report_date.getTimezoneOffset());
      const formattedDate = report_date.toISOString().split('T')[0];

      const cancelled_revenue = parseCurrency(cancelledRevenueValue);
      if (cancelled_revenue === null) {
        skippedDetails.push({ row: rowNum, reason: "Invalid or missing cancelled revenue value." });
        continue;
      }

      const existing = updates.get(formattedDate) || { cancelled_revenue: 0, cancelled_orders: 0 };
      existing.cancelled_revenue += cancelled_revenue;
      existing.cancelled_orders += 1;
      updates.set(formattedDate, existing);
      processedCount++;
    }

    for (const [date, values] of updates.entries()) {
      const { error } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update({
          cancelled_revenue: values.cancelled_revenue,
          cancelled_orders: values.cancelled_orders,
        })
        .eq("shop_id", shop_id)
        .eq("report_date", date);

      if (error) {
        console.error(`Failed to update for date ${date}:`, error);
        // Don't throw, just log, so other updates can proceed
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