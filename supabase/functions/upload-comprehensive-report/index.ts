// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const findColumn = (row: any, potentialNames: string[]) => {
  for (const name of potentialNames) {
    const key = Object.keys(row).find(k => k.toLowerCase().trim() === name.toLowerCase());
    if (key && row[key] !== undefined) return row[key];
  }
  return null;
};

const parseAndCleanNumber = (value: any) => {
  if (value === null || value === undefined) return null;
  const num = Number(String(value).replace(/[^0-9.-]+/g,""));
  return isNaN(num) ? null : num;
};

/**
 * Parse date from various formats and return ISO date string
 * Handles multiple date formats commonly found in Excel files
 */
const parseDate = (value: any): string | null => {
  if (!value) return null;
  
  // If it's already a Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().split('T')[0];
  }
  
  // If it's a string, try various formats
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    
    // Try different date formats
    const formats = [
      // DD/MM/YYYY or DD-MM-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // MM/DD/YYYY or MM-DD-YYYY  
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // YYYY/MM/DD or YYYY-MM-DD
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    ];
    
    // Try YYYY-MM-DD format first (ISO format)
    let match = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const day = parseInt(match[3]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // Try DD/MM/YYYY format (common in Vietnamese Excel files)
    match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const year = parseInt(match[3]);
      
      // Validate the date makes sense (day <= 31, month <= 12)
      if (day <= 31 && month < 12 && year > 1900 && year < 2100) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Try parsing as a general date string
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  // If it's a number (Excel date serial number)
  if (typeof value === 'number' && value > 0) {
    try {
      // Excel date serial number (days since 1900-01-01, with some quirks)
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch
      const date = new Date(excelEpoch.getTime() + value * 86400000);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fall through to return null
    }
  }
  
  return null;
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

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("File và shop_id là bắt buộc.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const reportsToUpsert = json.map((row, index) => {
      const report_date_raw = findColumn(row, ["Ngày", "Date", "Ngày báo cáo", "Report Date"]);
      if (!report_date_raw) {
        console.warn(`Row ${index + 1}: Missing date column`);
        return null;
      }
      
      const report_date = parseDate(report_date_raw);
      if (!report_date) {
        console.warn(`Row ${index + 1}: Invalid date format: "${report_date_raw}"`);
        return null;
      }

      return {
        shop_id,
        report_date,
        total_revenue: parseAndCleanNumber(findColumn(row, ["Doanh thu", "Revenue"])),
        total_orders: parseAndCleanNumber(findColumn(row, ["Số đơn hàng", "Orders"])),
        total_visits: parseAndCleanNumber(findColumn(row, ["Lượt truy cập", "Visits"])),
        conversion_rate: parseAndCleanNumber(findColumn(row, ["Tỷ lệ chuyển đổi", "Conversion Rate"])),
        product_clicks: parseAndCleanNumber(findColumn(row, ["Lượt click sản phẩm", "Product Clicks"])),
        total_buyers: parseAndCleanNumber(findColumn(row, ["Tổng số người mua", "Total Buyers"])),
        new_buyers: parseAndCleanNumber(findColumn(row, ["Người mua mới", "New Buyers"])),
        existing_buyers: parseAndCleanNumber(findColumn(row, ["Người mua hiện tại", "Existing Buyers"])),
        cancelled_orders: parseAndCleanNumber(findColumn(row, ["Đơn hủy", "Cancelled Orders"])),
        cancelled_revenue: parseAndCleanNumber(findColumn(row, ["Doanh thu đơn hủy", "Cancelled Revenue"])),
        returned_orders: parseAndCleanNumber(findColumn(row, ["Đơn trả hàng", "Returned Orders"])),
        returned_revenue: parseAndCleanNumber(findColumn(row, ["Doanh thu trả hàng", "Returned Revenue"])),
      };
    }).filter(Boolean);

    if (reportsToUpsert.length === 0) {
      throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra định dạng ngày tháng và đảm bảo có cột 'Ngày' hoặc 'Date'.");
    }

    const { error } = await supabaseAdmin
      .from("shopee_comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "shop_id,report_date" });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      message: `Tải lên thành công ${reportsToUpsert.length} báo cáo.`,
      processed_rows: json.length,
      valid_rows: reportsToUpsert.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Lỗi xử lý file. Vui lòng kiểm tra định dạng ngày tháng trong file Excel."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});