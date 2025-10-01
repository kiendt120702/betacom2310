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

// Function to format Excel date number to 'YYYY-MM-DD'
function excelDateToJSDate(serial) {
  if (typeof serial === 'string') {
    // Handle 'MM/DD/YYYY' format
    const parts = serial.split('/');
    if (parts.length === 3) {
      // Assuming MM/DD/YYYY
      return new Date(Date.UTC(parts[2], parts[0] - 1, parts[1]));
    }
    // Try parsing directly if it's another string format
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof serial === 'number') {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
  return null;
}

function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

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

    // 1. Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);

    if (downloadError) throw downloadError;

    // 2. Parse Excel file
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

    // 3. Process and upsert data in batches
    const reportsToUpsert = [];
    for (const [index, row] of json.entries()) {
      const reportDateRaw = row["Ngày"];
      if (!reportDateRaw) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: "Missing 'Ngày' (Date)" });
        continue;
      }

      const reportDate = excelDateToJSDate(reportDateRaw);
      if (!reportDate || isNaN(reportDate.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({ row: index + 2, reason: `Invalid date format for 'Ngày': ${reportDateRaw}` });
        continue;
      }

      const conversionRateStr = String(row["Tỷ lệ chuyển đổi"] || '0');
      const conversionRate = parseFloat(conversionRateStr.replace('%', '')) || 0;

      reportsToUpsert.push({
        shop_id,
        report_date: formatDate(reportDate),
        total_revenue: parseFloat(row["Tổng giá trị hàng hóa (₫)"] || 0),
        platform_subsidized_revenue: parseFloat(row["Doanh thu được nền tảng trợ cấp (₫)"] || 0),
        items_sold: parseInt(row["Số món bán ra"] || 0),
        total_buyers: parseInt(row["Khách hàng"] || 0),
        total_visits: parseInt(row["Lượt xem trang sản phẩm"] || 0),
        store_visits: parseInt(row["Lượt truy cập Cửa hàng"] || 0),
        sku_orders: parseInt(row["Đơn hàng SKU"] || 0),
        total_orders: parseInt(row["Đơn hàng"] || 0),
        conversion_rate: conversionRate,
      });
    }

    if (reportsToUpsert.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToUpsert, { onConflict: "shop_id, report_date" });

      if (upsertError) throw upsertError;
      results.processedRows = reportsToUpsert.length;
    }

    // 4. Clean up uploaded file
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