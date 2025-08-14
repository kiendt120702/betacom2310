import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

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

// Helper to parse date values from various formats
const parseDate = (value: any): string | null => {
    if (!value) return null;
    // Handle Excel's numeric date format
    if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date.toISOString().split('T')[0];
    }
    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
        // Try to parse formats like "DD-MM-YYYY" or "YYYY-MM-DD"
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
            let day, month, year;
            if (parts[2].length === 4) { // DD-MM-YYYY
                day = parseInt(parts[0]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[2]);
            } else { // YYYY-MM-DD
                day = parseInt(parts[2]);
                month = parseInt(parts[1]) - 1;
                year = parseInt(parts[0]);
            }
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month, day).toISOString().split('T')[0];
            }
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

    if (profileError || !profile || !['admin', 'leader'].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("File not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const jsonData: any[] = utils.sheet_to_json(worksheet);
    if (jsonData.length === 0) throw new Error("No data found in the sheet");

    const reportsToUpsert = jsonData.map(row => {
      const reportDate = parseDate(row["Ngày"]);
      if (!reportDate) return null;

      return {
        report_date: reportDate,
        total_revenue: parseVietnameseNumber(row["Tổng doanh số (VND)"]),
        total_orders: parseInt(String(row["Tổng số đơn hàng"]), 10),
        average_order_value: parseVietnameseNumber(row["Doanh số trên mỗi đơn hàng"]),
        product_clicks: parseInt(String(row["Lượt nhấp vào sản phẩm"]), 10),
        total_visits: parseInt(String(row["Số lượt truy cập"]), 10),
        conversion_rate: parsePercentage(row["Tỷ lệ chuyển đổi đơn hàng"]),
        cancelled_orders: parseInt(String(row["Đơn đã hủy"]), 10),
        cancelled_revenue: parseVietnameseNumber(row["Doanh số đơn hủy"]),
        returned_orders: parseInt(String(row["Đơn đã hoàn trả / hoàn tiền"]), 10),
        returned_revenue: parseVietnameseNumber(row["Doanh số các đơn Trả hàng/Hoàn tiền"]),
        total_buyers: parseInt(String(row["số người mua"]), 10),
        new_buyers: parseInt(String(row["số người mua mới"]), 10),
        existing_buyers: parseInt(String(row["số người mua hiện tại"]), 10),
        potential_buyers: parseInt(String(row["số người mua tiềm năng"]), 10),
        buyer_return_rate: parsePercentage(row["Tỉ lệ quay lại của người mua"]),
      };
    }).filter(Boolean);

    if (reportsToUpsert.length === 0) {
      throw new Error("No valid data rows found to import");
    }

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "report_date" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ message: `Successfully imported ${reportsToUpsert.length} report(s).` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});