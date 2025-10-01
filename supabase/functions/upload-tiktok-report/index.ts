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

    const reportsToUpsert = json.map((row) => {
      const report_date_raw = findColumn(row, ["Ngày", "Date"]);
      if (!report_date_raw) return null;
      const report_date = new Date(report_date_raw).toISOString().split('T')[0];

      return {
        shop_id,
        report_date,
        total_revenue: parseAndCleanNumber(findColumn(row, ["Tổng giá trị hàng hóa (₫)", "Total Revenue"])),
        returned_revenue: parseAndCleanNumber(findColumn(row, ["Hoàn tiền (₫)", "Returned Revenue"])),
        platform_subsidized_revenue: parseAndCleanNumber(findColumn(row, ["Doanh thu có trợ cấp (₫)", "Platform Subsidized Revenue"])),
        items_sold: parseAndCleanNumber(findColumn(row, ["Số món bán ra", "Items Sold"])),
        total_buyers: parseAndCleanNumber(findColumn(row, ["Khách hàng", "Total Buyers"])),
        total_visits: parseAndCleanNumber(findColumn(row, ["Lượt xem trang", "Total Visits"])),
        store_visits: parseAndCleanNumber(findColumn(row, ["Lượt truy cập Cửa hàng", "Store Visits"])),
        sku_orders: parseAndCleanNumber(findColumn(row, ["Đơn hàng SKU", "SKU Orders"])),
        total_orders: parseAndCleanNumber(findColumn(row, ["Đơn hàng", "Total Orders"])),
        conversion_rate: parseAndCleanNumber(findColumn(row, ["Tỷ lệ chuyển đổi", "Conversion Rate"])),
      };
    }).filter(Boolean);

    if (reportsToUpsert.length === 0) {
      throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
    }

    const { error } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "shop_id,report_date" });

    if (error) throw error;

    return new Response(JSON.stringify({ message: `Tải lên thành công ${reportsToUpsert.length} báo cáo TikTok.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});