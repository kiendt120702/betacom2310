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

const parseVietnameseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

const parseDate = (value: any): string | null => {
    if (!value) return null;
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
        let match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
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
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
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
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: false, raw: false });
    const sheetName = "OrderSKUList";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const sheetData: any[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false, blankrows: false });

    console.log("Raw sheet sample:", sheetData.slice(0, 5));

    if (sheetData.length < 2) {
      throw new Error("File không có đủ dữ liệu.");
    }

    let headerRowIndex = -1;
    const requiredHeaders = ["Order Refund Amount", "Created Time"];
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i].map(cell => typeof cell === 'string' ? cell.trim() : cell);
      if (requiredHeaders.every(header => row.includes(header))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(`Không tìm thấy dòng tiêu đề hợp lệ. Dòng tiêu đề phải chứa: ${requiredHeaders.join(', ')}`);
    }

    const headers = sheetData[headerRowIndex].map(h => h ? String(h).trim() : "");
    console.log("Detected header row index:", headerRowIndex, "Headers:", headers);
    const dataRows = sheetData.slice(headerRowIndex + 1);

    const revenueByDate = new Map<string, number>();

    dataRows.forEach((rowData, index) => {
      if (!rowData || rowData.length === 0) return;

      const rowObject = headers.reduce((obj, header, headerIndex) => {
        if (header) obj[header] = rowData[headerIndex];
        return obj;
      }, {} as Record<string, any>);

      const rawDate = rowObject["Created Time"];
      const rawRefund = rowObject["Order Refund Amount"];
      const reportDate = parseDate(rawDate);
      const cancelledRevenue = parseVietnameseNumber(rawRefund);

      console.log(
        `Row ${headerRowIndex + index + 2}:`,
        { rawRefund, parsedRefund: cancelledRevenue, rawDate, parsedDate: reportDate }
      );

      if (reportDate && cancelledRevenue > 0) {
        revenueByDate.set(reportDate, (revenueByDate.get(reportDate) || 0) + cancelledRevenue);
      }
    });

    console.log("Aggregated revenue by date:", Array.from(revenueByDate.entries()));

    if (revenueByDate.size === 0) {
      throw new Error("Không tìm thấy dữ liệu doanh số hủy hợp lệ.");
    }

    const reportsToUpsert = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      shop_id: shopId,
      report_date: date,
      cancelled_revenue: revenue,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    const successDetails = { 
      message: `Đã cập nhật thành công doanh số hủy cho ${reportsToUpsert.length} ngày.`,
      details: {
        shop_id: shopId,
        daysUpdated: reportsToUpsert.length,
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
