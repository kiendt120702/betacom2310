
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
    
    if (!jsonData || jsonData.length < 5) {
      throw new Error("File Excel không có đủ dữ liệu. Cần ít nhất 5 dòng (header ở dòng 4, dữ liệu từ dòng 5).");
    }

    console.log(`Total rows in Excel: ${jsonData.length}`);
    console.log(`Row 4 (headers):`, jsonData[3]);
    console.log(`Row 5 (first data):`, jsonData[4]);

    // Fixed: Lấy header từ dòng 4 (index 3)
    const headerRowIndex = 3;
    const headers = jsonData[headerRowIndex] as any[];
    
    if (!headers || headers.length === 0) {
        throw new Error("Không tìm thấy dòng tiêu đề ở dòng 4.");
    }

    // Trim headers to handle extra whitespace
    const cleanHeaders = headers.map(h => h ? String(h).trim() : '');
    console.log("Headers found:", cleanHeaders);

    // Check for required headers
    const requiredHeaders = ["Ngày", "Tổng doanh số (VND)", "Tổng số đơn hàng"];
    const foundAll = requiredHeaders.every(rh => cleanHeaders.includes(rh));
    
    if (!foundAll) {
        throw new Error(`File Excel thiếu các cột bắt buộc. Cần có: ${requiredHeaders.join(', ')}.`);
    }

    // Fixed: Lấy dữ liệu từ dòng 5 trở đi (index 4 trở đi)
    const dataRows = jsonData.slice(4);
    console.log(`Processing ${dataRows.length} data rows starting from row 5`);
    
    const reportsToUpsert = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowArray = dataRows[i];
      const actualRowNumber = i + 5; // Row number in Excel (1-indexed)
      
      if (!rowArray || rowArray.length === 0 || rowArray.every(cell => cell === null || cell === '')) {
        console.log(`Skipping empty row ${actualRowNumber}`);
        continue;
      }

      const rowData: { [key: string]: any } = {};
      cleanHeaders.forEach((header, index) => {
        if (header) {
          rowData[header] = rowArray[index];
        }
      });

      console.log(`Processing row ${actualRowNumber}:`, rowData);

      const reportDate = parseDate(rowData["Ngày"]);
      if (!reportDate) {
        console.log(`Skipping row ${actualRowNumber}: invalid date`, rowData["Ngày"]);
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
      
      console.log(`Parsed report for row ${actualRowNumber}:`, {
        date: report.report_date,
        revenue: report.total_revenue,
        orders: report.total_orders
      });
      
      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ để nhập từ dòng 5 trở đi.");
    }

    console.log(`Found ${reportsToUpsert.length} valid reports to upsert`);

    const uniqueReportsMap = new Map<string, any>();
    for (const report of reportsToUpsert) {
      const key = `${report.shop_id}_${report.report_date}`;
      uniqueReportsMap.set(key, report);
    }
    const uniqueReportsToUpsert = Array.from(uniqueReportsMap.values());

    console.log(`Upserting ${uniqueReportsToUpsert.length} unique reports`);

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert(uniqueReportsToUpsert, { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ 
        message: `Đã nhập thành công ${uniqueReportsToUpsert.length} báo cáo từ dòng 5 trở đi.`,
        details: {
          totalRowsProcessed: dataRows.length,
          validReports: reportsToUpsert.length,
          uniqueReports: uniqueReportsToUpsert.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
