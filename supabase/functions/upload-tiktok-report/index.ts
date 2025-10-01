// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to find a key in an object with multiple possible names (case-insensitive)
const findKey = (obj: any, keys: string[]) => {
  const lowerCaseKeyMap = Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase().trim()] = key;
    return acc;
  }, {} as Record<string, string>);
  for (const key of keys) {
    const lowerKey = key.toLowerCase().trim();
    if (lowerCaseKeyMap[lowerKey]) {
      return lowerCaseKeyMap[lowerKey];
    }
  }
  return null;
};

// Helper to parse numeric values from strings like "1,234.56" or "₫1,234"
const parseNumericValue = (value: any) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  // Remove currency symbols, thousands separators, and use dot as decimal separator
  const cleaned = value.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// Helper to parse percentage values like "1.23%"
const parsePercentageValue = (value: any) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

serve(async (req: Request) => {
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

    const workbook = XLSX.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // User specified that data starts on row 6, with headers on row 5.
    // The 'range' option in sheet_to_json is 0-indexed for the header row.
    // So, row 5 is index 4. This will use row 5 as headers and start data from row 6.
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 4, raw: false });

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
    };

    const reportsToUpsert = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 6; // Data starts from row 6 in Excel

      const dateKey = findKey(row, ["Ngày", "Date"]);
      if (!dateKey || !row[dateKey]) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: "Missing Date Column (e.g., 'Ngày')" });
        continue;
      }
      
      const report_date = new Date(row[dateKey]);
      if (isNaN(report_date.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Invalid date format in column '${dateKey}'` });
        continue;
      }

      const formattedDate = report_date.toISOString().split('T')[0];

      reportsToUpsert.push({
        shop_id,
        report_date: formattedDate,
        total_revenue: parseNumericValue(row[findKey(row, ['Tổng giá trị hàng hóa (₫)', 'Tổng giá trị hàng hóa'])]),
        platform_subsidized_revenue: parseNumericValue(row[findKey(row, ['Doanh thu được trợ cấp bởi nền tảng (₫)', 'Doanh thu được trợ cấp bởi nền tảng'])]),
        items_sold: parseNumericValue(row[findKey(row, ['Số món bán ra', 'Số món đã bán'])]),
        total_buyers: parseNumericValue(row[findKey(row, ['Khách hàng'])]),
        total_visits: parseNumericValue(row[findKey(row, ['Lượt xem trang sản phẩm'])]),
        store_visits: parseNumericValue(row[findKey(row, ['Lượt truy cập Cửa hàng'])]),
        sku_orders: parseNumericValue(row[findKey(row, ['Đơn hàng SKU'])]),
        total_orders: parseNumericValue(row[findKey(row, ['Đơn hàng'])]),
        conversion_rate: parsePercentageValue(row[findKey(row, ['Tỷ lệ chuyển đổi'])]),
      });
    }

    if (reportsToUpsert.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToUpsert, { onConflict: 'shop_id, report_date' });

      if (upsertError) {
        throw upsertError;
      }
      results.processedRows = reportsToUpsert.length;
    }

    // Clean up uploaded file
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(JSON.stringify({ ...results, message: `Xử lý hoàn tất! ${results.processedRows}/${results.totalRows} dòng đã được xử lý.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});