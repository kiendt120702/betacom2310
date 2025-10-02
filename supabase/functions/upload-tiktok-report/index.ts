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

// Helper to find the row number of the header, making it more robust
function findHeaderRow(worksheet) {
  if (!worksheet || !worksheet['!ref']) return 0;
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let hasDate = false;
    let hasRevenue = false;
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v && typeof cell.v === 'string') {
            const cellValue = cell.v.trim();
            if (cellValue === 'Ngày') hasDate = true;
            if (cellValue.startsWith('Tổng giá trị hàng hoá')) hasRevenue = true;
        }
    }
    if (hasDate && hasRevenue) {
      return R;
    }
  }
  return 0;
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
      let reportDateRaw = row["Ngày"];
      let reportDate: Date | null = null;

      if (reportDateRaw instanceof Date && !isNaN(reportDateRaw.getTime())) {
        reportDate = reportDateRaw;
      } else if (typeof reportDateRaw === 'string') {
        const parsed = new Date(reportDateRaw + 'T00:00:00Z');
        if (!isNaN(parsed.getTime())) {
          reportDate = parsed;
        }
      }

      if (!reportDate) {
        skippedDetails.push({ row: i + 2 + headerRowIndex, reason: `Missing or invalid date value: '${reportDateRaw}'` });
        continue;
      }

      const parseNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          return isNaN(num) ? null : num;
        }
        return null;
      };

      const parsePercentage = (val: any) => {
        if (typeof val === 'string' && val.includes('%')) {
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          return isNaN(num) ? null : num;
        }
        if (typeof val === 'number') {
          if (Math.abs(val) < 1 && val !== 0) {
            return val * 100;
          }
          return val;
        }
        return null;
      };

      const report = {
        shop_id,
        report_date: reportDate.toISOString().split('T')[0],
        total_revenue: parseNumeric(row["Tổng giá trị hàng hoá (₫)"] ?? row["Tổng giá trị hàng hoá(₫)"]),
        returned_revenue: parseNumeric(row["Hoàn tiền (₫)"] ?? row["Hoàn tiền(₫)"]),
        platform_subsidized_revenue: parseNumeric(row["Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm"]),
        items_sold: parseNumeric(row["Số món bán ra"]),
        total_buyers: parseNumeric(row["Số khách mua hàng"]),
        total_visits: parseNumeric(row["Lượt xem trang"]),
        store_visits: parseNumeric(row["Lượt truy cập Cửa hàng"]),
        sku_orders: parseNumeric(row["Đơn hàng SKU"]),
        total_orders: parseNumeric(row["Đơn hàng"]),
        conversion_rate: parsePercentage(row["Tỷ lệ chuyển đổi"] ?? row["Tỉ lệ chuyển đổi"]),
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