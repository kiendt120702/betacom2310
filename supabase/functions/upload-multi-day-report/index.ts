// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { format } from "https://esm.sh/date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const parseVietnameseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace('%', '').replace(',', '.'));
};

const parseDate = (value: any): string | null => {
    if (!value) return null;
    
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
        const match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const year = parseInt(match[3]);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }
    }
    
    if (typeof value === 'number' && value > 0) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date.toISOString().split('T')[0];
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'leader', 'chuyên viên'].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;
    if (!file) throw new Error("File not provided");
    if (!shopId) throw new Error("Shop ID not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true });
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const jsonData: any[][] = utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error("File Excel không có dữ liệu.");
    }

    // --- DYNAMIC HEADER FINDING LOGIC ---
    let headerRowIndex = -1;
    let headers: string[] = [];
    const requiredHeaders = ["Ngày", "Tổng doanh số (VND)", "Tổng số đơn hàng"];

    // Search for header row in the first 10 rows
    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
        const row = jsonData[i] as any[];
        if (row && Array.isArray(row) && row.length > 0) {
            // Trim headers to handle extra whitespace
            const potentialHeaders = row.map(h => h ? String(h).trim() : '');
            const foundAll = requiredHeaders.every(rh => potentialHeaders.includes(rh));
            if (foundAll) {
                headerRowIndex = i;
                headers = potentialHeaders;
                break;
            }
        }
    }

    if (headerRowIndex === -1) {
        throw new Error(`File Excel thiếu các cột bắt buộc hoặc không đúng định dạng. Không tìm thấy dòng tiêu đề chứa: ${requiredHeaders.join(', ')}.`);
    }

    // Data starts from the row after the header row
    const dataRows = jsonData.slice(headerRowIndex + 1);
    
    const reportsToUpsert = [];

    for (const rowArray of dataRows) {
      if (!rowArray || rowArray.length === 0 || rowArray.every(cell => cell === null || cell === '')) {
        continue;
      }

      const rowData: { [key: string]: any } = {};
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = rowArray[index];
        }
      });

      const reportDate = parseDate(rowData["Ngày"]);
      if (!reportDate) {
        continue;
      }

      const report = {
        shop_id: shopId,
        report_date: reportDate,
        total_revenue: parseVietnameseNumber(rowData["Tổng doanh số (VND)"]),
        total_orders: parseInt(String(rowData["Tổng số đơn hàng"]), 10) || 0,
        average_order_value: parseVietnameseNumber(rowData["Doanh số trên mỗi đơn hàng"]),
        product_clicks: parseInt(String(rowData["Lượt nhấp vào sản phẩm"]), 10) || 0,
        total_visits: parseInt(String(rowData["Số lượt truy cập"]), 10) || 0,
        conversion_rate: parsePercentage(rowData["Tỷ lệ chuyển đổi đơn hàng"]),
        cancelled_orders: parseInt(String(rowData["Đơn đã hủy"]), 10) || 0,
        cancelled_revenue: parseVietnameseNumber(rowData["Doanh số đơn hủy"]),
        returned_orders: parseInt(String(rowData["Đơn đã hoàn trả / hoàn tiền"]), 10) || 0,
        returned_revenue: parseVietnameseNumber(rowData["Doanh số các đơn Trả hàng/Hoàn tiền"]),
        total_buyers: parseInt(String(rowData["số người mua"]), 10) || 0,
        new_buyers: parseInt(String(rowData["số người mua mới"]), 10) || 0,
        existing_buyers: parseInt(String(rowData["số người mua hiện tại"]), 10) || 0,
        potential_buyers: parseInt(String(rowData["số người mua tiềm năng"]), 10) || 0,
        buyer_return_rate: parsePercentage(rowData["Tỉ lệ quay lại của người mua"]),
      };
      
      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ để nhập.");
    }

    const uniqueReportsMap = new Map<string, any>();
    for (const report of reportsToUpsert) {
      const key = `${report.shop_id}_${report.report_date}`;
      uniqueReportsMap.set(key, report);
    }
    const uniqueReportsToUpsert = Array.from(uniqueReportsMap.values());

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert(uniqueReportsToUpsert, { onConflict: "report_date,shop_id" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ message: `Đã nhập thành công ${uniqueReportsToUpsert.length} báo cáo.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});