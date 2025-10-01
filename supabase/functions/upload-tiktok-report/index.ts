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
  const cleaned = value.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// Helper to parse percentage values like "5.2%"
const parsePercentage = (value: any) => {
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
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
    };

    const reportsToInsert = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // Excel rows are 1-based, and we have a header

      const dateKey = findKey(row, ["Ngày", "Date"]);
      if (!dateKey) {
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

      const report = {
        shop_id,
        report_date: report_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        total_revenue: parseNumericValue(row[findKey(row, ['Tổng giá trị hàng hóa (₫)'])]),
        returned_revenue: parseNumericValue(row[findKey(row, ['Doanh thu hoàn tiền (₫)'])]),
        platform_subsidized_revenue: parseNumericValue(row[findKey(row, ['Doanh thu được trợ cấp bởi nền tảng (₫)'])]),
        items_sold: parseNumericValue(row[findKey(row, ['Số món bán ra'])]),
        total_buyers: parseNumericValue(row[findKey(row, ['Số người mua'])]),
        total_visits: parseNumericValue(row[findKey(row, ['Lượt xem trang sản phẩm'])]),
        store_visits: parseNumericValue(row[findKey(row, ['Lượt truy cập Cửa hàng'])]),
        sku_orders: parseNumericValue(row[findKey(row, ['Đơn hàng SKU'])]),
        total_orders: parseNumericValue(row[findKey(row, ['Đơn hàng'])]),
        conversion_rate: parsePercentage(row[findKey(row, ['Tỷ lệ chuyển đổi'])]),
      };

      reportsToInsert.push(report);
    }

    if (reportsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToInsert, { onConflict: 'shop_id, report_date' });

      if (insertError) throw insertError;
      results.processedRows = reportsToInsert.length;
    }

    // Clean up uploaded file
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(JSON.stringify({ ...results, message: `Xử lý hoàn tất! ${results.processedRows}/${results.totalRows} dòng đã được thêm/cập nhật.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});