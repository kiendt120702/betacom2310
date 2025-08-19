
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

// Helper to parse numeric values from Vietnamese format (e.g., "1.234,56")
const parseVietnameseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

// Helper to parse percentage values (e.g., "3,05%")
const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace('%', '').replace(',', '.'));
};

// Helper to parse date values from various formats, ensuring UTC to avoid timezone issues
const parseDate = (value: any): string | null => {
    if (!value) return null;
    
    // If value is already a Date object (from cellDates: true)
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }

    // Fallback for string dates like "DD-MM-YYYY..." or "DD/MM/YYYY..."
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
    
    // Fallback for Excel numeric dates if cellDates: true fails
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

    const jsonData: any[][] = utils.sheet_to_json(worksheet, { header: 1 });
    if (!jsonData || jsonData.length < 5) {
      throw new Error("File Excel không có đủ dữ liệu. Cần ít nhất 5 dòng (header ở dòng 4, dữ liệu ở dòng 5)");
    }

    console.log(`Total rows in Excel: ${jsonData.length}`);
    console.log(`Row 4 (headers):`, jsonData[3]);
    console.log(`Row 5 (data):`, jsonData[4]);

    // Fixed: Lấy header từ dòng 4 (index 3) và dữ liệu từ dòng 5 (index 4)
    const headers = jsonData[3] as string[];
    const dataRow = jsonData[4] as any[];

    const rowData: { [key: string]: any } = {};
    headers.forEach((header, index) => {
      rowData[header] = dataRow[index];
    });

    console.log("Parsed row data:", rowData);

    const reportDate = parseDate(rowData["Ngày"]);
    if (!reportDate) {
      throw new Error("Không tìm thấy ngày hợp lệ ở dòng thứ 5");
    }

    const reportToUpsert = {
      shop_id: shopId,
      report_date: reportDate,
      total_revenue: parseVietnameseNumber(rowData["Tổng doanh số (VND)"]),
      total_orders: parseInt(String(rowData["Tổng số đơn hàng"]), 10),
      average_order_value: parseVietnameseNumber(rowData["Doanh số trên mỗi đơn hàng"]),
      product_clicks: parseInt(String(rowData["Lượt nhấp vào sản phẩm"]), 10),
      total_visits: parseInt(String(rowData["Số lượt truy cập"]), 10),
      conversion_rate: parsePercentage(rowData["Tỷ lệ chuyển đổi đơn hàng"]),
      cancelled_orders: parseInt(String(rowData["Đơn đã hủy"]), 10),
      cancelled_revenue: parseVietnameseNumber(rowData["Doanh số đơn hủy"]),
      returned_orders: parseInt(String(rowData["Đơn đã hoàn trả / hoàn tiền"]), 10),
      returned_revenue: parseVietnameseNumber(rowData["Doanh số các đơn Trả hàng/Hoàn tiền"]),
      total_buyers: parseInt(String(rowData["số người mua"]), 10),
      new_buyers: parseInt(String(rowData["số người mua mới"]), 10),
      existing_buyers: parseInt(String(rowData["số người mua hiện tại"]), 10),
      potential_buyers: parseInt(String(rowData["số người mua tiềm năng"]), 10),
      buyer_return_rate: parsePercentage(rowData["Tỉ lệ quay lại của người mua"]),
    };

    console.log("Report to upsert:", reportToUpsert);

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert([reportToUpsert], { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({ message: `Đã nhập báo cáo thành công cho ngày ${format(new Date(reportDate), 'dd/MM/yyyy')} từ dòng 5.` }),
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
