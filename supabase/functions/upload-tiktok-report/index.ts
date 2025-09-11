// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/,/g, ''));
};

const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(String(value).replace('%', ''));
};

const parseDate = (value: any): string | null => {
    if (!value) return null;
    
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
        let match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const year = parseInt(match[3]);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }

        match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);
            if (!isNaN(year) && !isNaN(month) && !isNaN(year)) {
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

  let user;
  let file;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) throw new Error("Unauthorized");
    user = authUser;

    const formData = await req.formData();
    file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;
    if (!file) throw new Error("File not provided");
    if (!shopId) throw new Error("Shop ID not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { 
      type: "array", 
      cellDates: false,
      raw: false
    });
    const sheetName = "Sheet1";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const sheetData: any[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false, blankrows: false, range: 4 });

    if (sheetData.length < 2) {
      throw new Error("File không có đủ dữ liệu (cần ít nhất 6 dòng).");
    }

    const headers = sheetData[0].map(h => h ? String(h).trim() : "");
    const dataRows = sheetData.slice(1);

    const reportsToUpsert = [];
    
    for (const rowData of dataRows) {
      if (!rowData || rowData.length === 0 || !rowData[0]) continue;

      const rowObject = headers.reduce((obj, header, index) => {
        if(header) obj[header] = rowData[index];
        return obj;
      }, {});

      const reportDate = parseDate(rowObject["Ngày"]);
      if (!reportDate) continue;

      const report = {
        shop_id: shopId,
        report_date: reportDate,
        total_revenue: parseNumber(rowObject["Tổng giá trị hàng hóa (₫)"]) || 0,
        returned_revenue: parseNumber(rowObject["Hoàn tiền (₫)"]) || 0,
        platform_subsidized_revenue: parseNumber(rowObject["Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm"]) || 0,
        items_sold: parseInt(String(rowObject["Số món bán ra"]), 10) || 0,
        total_buyers: parseInt(String(rowObject["Khách hàng"]), 10) || 0,
        total_visits: parseInt(String(rowObject["Lượt xem trang"]), 10) || 0,
        store_visits: parseInt(String(rowObject["Lượt truy cập trang Cửa hàng"]), 10) || 0,
        sku_orders: parseInt(String(rowObject["Đơn hàng SKU"]), 10) || 0,
        total_orders: parseInt(String(rowObject["Đơn hàng"]), 10) || 0,
        conversion_rate: parsePercentage(rowObject["Tỷ lệ chuyển đổi"]) || 0,
      };
      
      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ để nhập.");
    }

    const { error: upsertError } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    const successDetails = { 
      message: `Đã cập nhật và nhập thành công ${reportsToUpsert.length} báo cáo.`,
      details: {
        shop_id: shopId,
        validReports: reportsToUpsert.length,
      }
    };

    return new Response(
      JSON.stringify(successDetails),
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