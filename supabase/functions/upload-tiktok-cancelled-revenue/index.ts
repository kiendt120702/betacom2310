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

    const updates = json.map((row) => {
      const report_date_raw = findColumn(row, ["Ngày", "Date"]);
      if (!report_date_raw) return null;
      const report_date = new Date(report_date_raw).toISOString().split('T')[0];

      return {
        report_date,
        cancelled_revenue: parseAndCleanNumber(findColumn(row, ["Doanh số hủy (₫)", "Cancelled Revenue"])),
        cancelled_orders: parseAndCleanNumber(findColumn(row, ["Đơn hàng hủy", "Cancelled Orders"])),
      };
    }).filter(Boolean);

    if (updates.length === 0) {
      throw new Error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
    }

    let updatedCount = 0;
    for (const update of updates) {
      if (update.report_date) {
        const { error, count } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .update({
            cancelled_revenue: update.cancelled_revenue,
            cancelled_orders: update.cancelled_orders,
          })
          .eq('shop_id', shop_id)
          .eq('report_date', update.report_date);
        
        if (error) {
          console.error(`Failed to update report for date ${update.report_date}:`, error.message);
        } else if (count && count > 0) {
          updatedCount += count;
        }
      }
    }

    return new Response(JSON.stringify({ message: `Cập nhật thành công doanh số hủy cho ${updatedCount} báo cáo.` }), {
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