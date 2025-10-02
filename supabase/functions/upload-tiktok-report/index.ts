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
    const requiredHeaders = new Set(["ngày", "đơn hàng", "lượt xem trang"]);
    let foundHeaders = 0;
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v && typeof cell.v === 'string') {
            // Normalize for unicode characters (e.g., from macOS) and trim
            const cellValue = cell.v.trim().normalize("NFC").toLowerCase();
            if (requiredHeaders.has(cellValue)) {
                foundHeaders++;
            }
        }
    }
    // If we find at least 2 of the required headers, we can be confident this is the header row.
    if (foundHeaders >= 2) {
      return R;
    }
  }
  return 0; // Fallback
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

    // Helper to get value from a row object using a list of possible keys (case-insensitive, trim spaces, normalized)
    const getValueFromRow = (row, possibleKeys) => {
      const rowKeys = Object.keys(row);
      for (const pKey of possibleKeys) {
          const normalizedPKey = pKey.trim().normalize("NFC").toLowerCase();
          const foundKey = rowKeys.find(k => k.trim().normalize("NFC").toLowerCase() === normalizedPKey);
          if (foundKey && row[foundKey] !== undefined) {
              return row[foundKey];
          }
      }
      return undefined;
    }

    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      let reportDateRaw = getValueFromRow(row, ["Ngày"]);
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
          const num = parseFloat(val.replace(/[^0-9.,%]+/g, "").replace(',', '.'));
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
        total_revenue: parseNumeric(getValueFromRow(row, ["Tổng giá trị hàng hoá (₫)", "Tổng giá trị hàng hoá(₫)"])),
        returned_revenue: parseNumeric(getValueFromRow(row, ["Hoàn tiền (₫)", "Hoàn tiền(₫)"])),
        platform_subsidized_revenue: parseNumeric(getValueFromRow(row, ["Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm"])),
        items_sold: parseNumeric(getValueFromRow(row, ["Số món bán ra"])),
        total_buyers: parseNumeric(getValueFromRow(row, ["Số khách mua hàng"])),
        total_visits: parseNumeric(getValueFromRow(row, ["Lượt xem trang"])),
        store_visits: parseNumeric(getValueFromRow(row, ["Lượt truy cập Cửa hàng"])),
        sku_orders: parseNumeric(getValueFromRow(row, ["Đơn hàng SKU"])),
        total_orders: parseNumeric(getValueFromRow(row, ["Đơn hàng"])),
        conversion_rate: parsePercentage(getValueFromRow(row, ["Tỷ lệ chuyển đổi", "Tỉ lệ chuyển đổi"])),
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