// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hàm chuẩn hóa header, loại bỏ dấu và chuyển về chữ thường
const normalizeHeader = (header: string): string => {
  if (!header) return "";
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
};

// Ánh xạ từ header đã chuẩn hóa sang cột trong database
const headerMapping: { [key: string]: string } = {
  'ngay': 'report_date',
  'date': 'report_date',
  'tong gia tri hang hoa (d)': 'total_revenue',
  'hoan tien (d)': 'returned_revenue',
  'doanh thu duoc tro cap boi nen tang (d)': 'platform_subsidized_revenue',
  'phan tich tong doanh thu co tro cap cua nen tang cho san pham': 'platform_subsidized_revenue',
  'so mon ban ra': 'items_sold',
  'khach hang': 'total_buyers',
  'luot xem trang san pham': 'total_visits',
  'luot xem trang': 'total_visits',
  'luot truy cap trang cua hang': 'store_visits',
  'don hang sku': 'sku_orders',
  'don hang': 'total_orders',
  'ty le chuyen doi': 'conversion_rate',
};

const requiredColumns = ['report_date'];

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("Vui lòng cung cấp file và chọn shop.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    if (jsonData.length < 2) {
      throw new Error("File Excel không có đủ dữ liệu.");
    }

    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.some(cell => typeof cell === 'string' && normalizeHeader(cell) === 'ngay')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Không tìm thấy dòng header. Dòng header phải chứa cột 'Ngày'.");
    }

    const headers: string[] = jsonData[headerRowIndex];
    const dataStartIndex = headerRowIndex + 1;

    if (jsonData.length <= dataStartIndex) {
        throw new Error("Không tìm thấy dòng dữ liệu nào sau dòng header.");
    }
    
    const normalizedHeaders = headers.map(h => normalizeHeader(String(h)));
    
    const columnIndexMap: { [key: string]: number } = {};
    const foundColumns: string[] = [];

    normalizedHeaders.forEach((normHeader, index) => {
      const dbColumn = headerMapping[normHeader];
      if (dbColumn) {
        columnIndexMap[dbColumn] = index;
        if (!foundColumns.includes(dbColumn)) {
          foundColumns.push(dbColumn);
        }
      }
    });

    const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Các cột bắt buộc không tìm thấy: ${missingColumns.join(', ')}. Vui lòng kiểm tra lại file Excel.`);
    }

    const reportsToInsert = [];
    const skippedDetails: { row: number; reason: string }[] = [];

    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0 || !row[columnIndexMap['report_date']]) {
        skippedDetails.push({ row: i + 1, reason: "Dòng trống hoặc thiếu ngày báo cáo." });
        continue;
      }

      const report: any = { shop_id };
      let hasErrorInRow = false;

      for (const dbColumn in columnIndexMap) {
        const colIndex = columnIndexMap[dbColumn];
        let value = row[colIndex];

        if (value === undefined || value === null || String(value).trim() === '-' || String(value).trim() === '') {
          report[dbColumn] = null;
          continue;
        }

        try {
          if (dbColumn === 'report_date') {
            if (value instanceof Date) {
              report[dbColumn] = value.toISOString().split('T')[0];
            } else if (typeof value === 'string') {
              const parts = value.split(/[-/]/);
              let date;
              if (parts.length === 3) {
                // Handle DD-MM-YYYY or MM-DD-YYYY
                if (parseInt(parts[1]) > 12) { // DD-MM-YYYY
                  date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else { // MM-DD-YYYY
                  date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
                }
              } else {
                date = new Date(value);
              }
              if (isNaN(date.getTime())) throw new Error(`Invalid date format: ${value}`);
              report[dbColumn] = date.toISOString().split('T')[0];
            } else {
              throw new Error(`Unsupported date type: ${typeof value}`);
            }
          } else if (typeof value === 'string' && dbColumn.includes('revenue')) {
            report[dbColumn] = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
          } else if (typeof value === 'string' && dbColumn === 'conversion_rate') {
            report[dbColumn] = parseFloat(value.replace('%', '')) || 0;
          } else if (typeof value === 'string') {
            report[dbColumn] = parseInt(value.replace(/,/g, ''), 10) || 0;
          } else if (typeof value === 'number') {
            report[dbColumn] = value;
          }
        } catch (e) {
          skippedDetails.push({ row: i + 1, reason: `Lỗi xử lý cột ${dbColumn}: ${e.message}` });
          hasErrorInRow = true;
          break;
        }
      }
      if (!hasErrorInRow) {
        reportsToInsert.push(report);
      }
    }

    if (reportsToInsert.length > 0) {
      const { error } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToInsert, { onConflict: 'shop_id, report_date' });

      if (error) {
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Xử lý hoàn tất. Đã xử lý ${reportsToInsert.length} dòng, bỏ qua ${skippedDetails.length} dòng.`,
        totalRows: jsonData.length - dataStartIndex,
        processedRows: reportsToInsert.length,
        skippedCount: skippedDetails.length,
        skippedDetails: skippedDetails.slice(0, 20), // Giới hạn chi tiết lỗi trả về
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});