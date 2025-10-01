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

// Helper to parse various date formats
const parseDate = (dateValue: any): Date | null => {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  if (typeof dateValue === 'string') {
    // Try YYYY-MM-DD
    let match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const date = new Date(Date.UTC(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])));
      if (!isNaN(date.getTime())) return date;
    }
    // Try DD/MM/YYYY
    match = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const date = new Date(Date.UTC(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1])));
      if (!isNaN(date.getTime())) return date;
    }
    // Fallback to standard parsing
    const fallbackDate = new Date(dateValue);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }
  return null;
};

const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? null : num;
};

const parsePercentage = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const strValue = String(value).replace('%', '').trim();
    const num = parseFloat(strValue);
    return isNaN(num) ? null : num;
};

const HEADER_MAPPINGS = {
  report_date: ["date", "ngày"],
  total_revenue: ["tổng giá trị hàng hóa (₫)", "gross revenue"],
  returned_revenue: ["hoàn tiền cho đơn hàng (₫)", "refund"],
  platform_subsidized_revenue: ["doanh thu có trợ cấp của nền tảng (₫)", "platform campaign"],
  items_sold: ["số món bán ra", "units sold"],
  total_buyers: ["khách hàng", "paid buyers"],
  total_visits: ["lượt xem trang sản phẩm", "product page views"],
  store_visits: ["lượt truy cập cửa hàng", "shop page views"],
  sku_orders: ["đơn hàng sku", "sku-level orders"],
  total_orders: ["đơn hàng", "paid orders"],
  conversion_rate: ["tỷ lệ chuyển đổi", "conversion rate"],
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
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

    if (jsonData.length === 0) {
      throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
    }

    const headers = Object.keys(jsonData[0]).map(h => String(h || '').trim().toLowerCase());
    const columnIndexMap: { [key: string]: string } = {};
    const missingHeaders: string[] = [];

    for (const [dbField, possibleHeaders] of Object.entries(HEADER_MAPPINGS)) {
      const foundHeader = Object.keys(jsonData[0]).find(header => possibleHeaders.includes(String(header || '').trim().toLowerCase()));
      if (foundHeader) {
        columnIndexMap[dbField] = foundHeader;
      } else if (dbField === 'report_date' || dbField === 'total_revenue') { // Essential fields
        missingHeaders.push(possibleHeaders.join(' or '));
      }
    }

    if (missingHeaders.length > 0) {
      throw new Error(`Các cột bắt buộc không tìm thấy: ${missingHeaders.join(', ')}`);
    }

    const reportsToUpsert = [];
    const skippedRows: { row: number; reason: string }[] = [];

    for (const [index, row] of jsonData.entries()) {
      const rowNumber = index + 2; // +1 for header, +1 for 1-based index
      
      const dateValue = row[columnIndexMap.report_date];
      const date = parseDate(dateValue);

      if (!date) {
        skippedRows.push({ row: rowNumber, reason: `Định dạng ngày không hợp lệ: '${dateValue}'` });
        continue;
      }

      const report = {
        shop_id,
        report_date: formatDate(date),
        total_revenue: parseNumber(row[columnIndexMap.total_revenue]),
        returned_revenue: parseNumber(row[columnIndexMap.returned_revenue]),
        platform_subsidized_revenue: parseNumber(row[columnIndexMap.platform_subsidized_revenue]),
        items_sold: parseNumber(row[columnIndexMap.items_sold]),
        total_buyers: parseNumber(row[columnIndexMap.total_buyers]),
        total_visits: parseNumber(row[columnIndexMap.total_visits]),
        store_visits: parseNumber(row[columnIndexMap.store_visits]),
        sku_orders: parseNumber(row[columnIndexMap.sku_orders]),
        total_orders: parseNumber(row[columnIndexMap.total_orders]),
        conversion_rate: parsePercentage(row[columnIndexMap.conversion_rate]),
      };

      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
      throw new Error("Không có dòng dữ liệu hợp lệ nào được tìm thấy để xử lý.");
    }

    const { error: upsertError } = await supabaseAdmin
      .from('tiktok_comprehensive_reports')
      .upsert(reportsToUpsert, { onConflict: 'shop_id, report_date' });

    if (upsertError) {
      throw upsertError;
    }

    const message = `Xử lý thành công. Đã cập nhật/thêm ${reportsToUpsert.length} bản ghi.`;
    const responsePayload = { 
        message,
        totalRows: jsonData.length,
        processedRows: reportsToUpsert.length,
        skippedCount: skippedRows.length,
        skippedDetails: skippedRows.slice(0, 20)
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