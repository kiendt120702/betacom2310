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
    if (typeof value !== 'string' || !value.includes('%')) return null;
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

    // Find header row and map columns
    let headerRowIndex = -1;
    const headerMap: { [key: string]: number } = {};
    
    for (let i = 0; i < rawJson.length; i++) {
        const row = rawJson[i];
        if (row.some(cell => typeof cell === 'string' && cell.includes('Tổng giá trị hàng hóa'))) {
            headerRowIndex = i;
            row.forEach((header, index) => {
                if (typeof header !== 'string') return;
                const normalizedHeader = header.trim();
                if (normalizedHeader.includes('Ngày')) headerMap['date'] = index;
                if (normalizedHeader.includes('Tổng giá trị hàng hóa')) headerMap['total_revenue'] = index;
                if (normalizedHeader.includes('Doanh thu được hoàn lại')) headerMap['returned_revenue'] = index;
                if (normalizedHeader.includes('Doanh thu được trợ giá')) headerMap['platform_subsidized_revenue'] = index;
                if (normalizedHeader.includes('Số món bán ra')) headerMap['items_sold'] = index;
                if (normalizedHeader === 'Khách hàng') headerMap['total_buyers'] = index;
                if (normalizedHeader.includes('Lượt xem trang sản phẩm')) headerMap['total_visits'] = index;
                if (normalizedHeader.includes('Lượt truy cập Cửa hàng')) headerMap['store_visits'] = index;
                if (normalizedHeader.includes('Đơn hàng SKU')) headerMap['sku_orders'] = index;
                if (normalizedHeader === 'Đơn hàng') headerMap['total_orders'] = index;
                if (normalizedHeader.includes('Tỷ lệ chuyển đổi')) headerMap['conversion_rate'] = index;
            });
            break;
        }
    }

    if (headerRowIndex === -1 || headerMap['date'] === undefined || headerMap['total_revenue'] === undefined) {
      throw new Error("Could not find the header row or required columns ('Ngày', 'Tổng giá trị hàng hóa').");
    }

    const dataRows = rawJson.slice(headerRowIndex + 1);

    const reportsToUpsert = [];
    const skippedDetails = [];
    let processedCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = headerRowIndex + i + 2;

      const dateValue = row[headerMap['date']];
      if (!dateValue) {
        skippedDetails.push({ row: rowNum, reason: "Empty date column." });
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

      const report = {
        shop_id,
        report_date: formattedDate,
        total_revenue: parseCurrency(row[headerMap['total_revenue']]),
        returned_revenue: parseCurrency(row[headerMap['returned_revenue']]),
        platform_subsidized_revenue: parseCurrency(row[headerMap['platform_subsidized_revenue']]),
        items_sold: parseCurrency(row[headerMap['items_sold']]),
        total_buyers: parseCurrency(row[headerMap['total_buyers']]),
        total_visits: parseCurrency(row[headerMap['total_visits']]),
        store_visits: parseCurrency(row[headerMap['store_visits']]),
        sku_orders: parseCurrency(row[headerMap['sku_orders']]),
        total_orders: parseCurrency(row[headerMap['total_orders']]),
        conversion_rate: parsePercentage(row[headerMap['conversion_rate']]),
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