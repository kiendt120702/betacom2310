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

// Function to find a value in a row object with multiple possible keys (case-insensitive and trimmed)
function findValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    if (row[key] !== undefined) return row[key];
  }
  const lowerCaseKeys = possibleKeys.map(k => k.toLowerCase().trim());
  for (const originalKey in row) {
    const trimmedOriginalKey = originalKey.trim().toLowerCase();
    if (lowerCaseKeys.includes(trimmedOriginalKey)) {
      return row[originalKey];
    }
  }
  return undefined;
}

// Function to parse various date formats from Excel
function parseDate(serial) {
  if (serial instanceof Date) return serial;
  if (typeof serial === 'number') {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate()));
  }
  if (typeof serial === 'string') {
    const parts = serial.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (parts) {
      return new Date(Date.UTC(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1])));
    }
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getUTCMonth() + 1);
  let day = '' + d.getUTCDate();
  const year = d.getUTCFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

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

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);

    if (downloadError) throw downloadError;

    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const results = {
      totalRows: json.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [],
    };

    if (json.length === 0) {
      return new Response(JSON.stringify({ ...results, message: "File is empty." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const [index, row] of json.entries()) {
      const reportDateRaw = findValue(row, ["Ngày", "Date", "Thời gian hủy", "Cancellation Time"]);
      if (reportDateRaw === undefined) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: "Missing Date Column (e.g., 'Ngày', 'Thời gian hủy')" });
        continue;
      }

      const reportDate = parseDate(reportDateRaw);
      if (!reportDate || isNaN(reportDate.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: `Invalid date format: ${reportDateRaw}` });
        continue;
      }

      const formattedDate = formatDate(reportDate);
      const cancelledRevenue = parseFloat(findValue(row, ["Doanh thu đơn hủy (₫)", "Doanh thu đơn hủy", "Cancelled GMV (₫)"]) || 0);
      const cancelledOrders = parseInt(findValue(row, ["Đơn hàng hủy", "Số đơn hủy", "Cancelled Orders"]) || 0);

      const { error: updateError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update({
          cancelled_revenue: cancelledRevenue,
          cancelled_orders: cancelledOrders,
        })
        .eq("shop_id", shop_id)
        .eq("report_date", formattedDate);

      if (updateError) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: `DB Update Error: ${updateError.message}` });
      } else {
        results.processedRows++;
      }
    }

    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(JSON.stringify({ ...results, message: "File processed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});