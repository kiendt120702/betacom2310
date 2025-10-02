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

// Helper to find the row number of the header
function findHeaderRow(worksheet) {
  if (!worksheet || !worksheet['!ref']) return 0;
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 }); // A1, A2, etc.
    const cell = worksheet[cellAddress];
    // Check if the first cell of the row is 'Ngày'
    if (cell && cell.v && typeof cell.v === 'string' && cell.v.trim() === 'Ngày') {
      return R;
    }
  }
  return 0; // Default to first row if not found
}


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

    const workbook = XLSX.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const headerRowIndex = findHeaderRow(worksheet);
    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex });

    const processedRows = [];
    const skippedDetails = [];
    let processedCount = 0;

    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      const reportDate = row["Ngày"];

      if (!reportDate || !(reportDate instanceof Date)) {
        skippedDetails.push({ row: i + 2 + headerRowIndex, reason: "Missing or invalid date" });
        continue;
      }

      // Helper to parse numeric values from strings or numbers
      const parseNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          return isNaN(num) ? null : num;
        }
        return null;
      };

      // Helper to parse percentage strings like "2.55%"
      const parsePercentage = (val: any) => {
        if (typeof val === 'string' && val.includes('%')) {
          const num = parseFloat(val.replace('%', ''));
          return isNaN(num) ? null : num;
        }
        if (typeof val === 'number') return val * 100;
        return null;
      };

      const report = {
        shop_id,
        report_date: reportDate.toISOString().split('T')[0],
        total_revenue: parseNumeric(row["Tổng giá trị hàng hoá(₫)"]),
        returned_revenue: parseNumeric(row["Hoàn tiền(₫)"]),
        platform_subsidized_revenue: parseNumeric(row["Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm"]),
        items_sold: parseNumeric(row["Số món bán ra"]),
        total_buyers: parseNumeric(row["Số khách mua hàng"]),
        total_visits: parseNumeric(row["Lượt xem trang"]),
        store_visits: parseNumeric(row["Lượt truy cập Cửa hàng"]),
        sku_orders: parseNumeric(row["Đơn hàng SKU"]),
        total_orders: parseNumeric(row["Đơn hàng"]),
        conversion_rate: parsePercentage(row["Tỷ lệ chuyển đổi"]),
      };

      processedRows.push(report);
      processedCount++;
    }

    if (processedRows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(processedRows, { onConflict: "shop_id, report_date" });

      if (upsertError) throw upsertError;
    }

    // Clean up the uploaded file
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(
      JSON.stringify({
        message: `Xử lý thành công ${processedCount} dòng. Bỏ qua ${skippedDetails.length} dòng.`,
        totalRows: json.length,
        processedRows: processedCount,
        skippedCount: skippedDetails.length,
        skippedDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing TikTok report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});