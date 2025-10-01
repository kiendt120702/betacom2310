// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to find a key in an object with multiple possible names (case-insensitive)
const findKey = (obj: any, keys: string[]) => {
  const lowerCaseKeyMap = Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase().trim()] = key;
    return acc;
  }, {} as Record<string, string>);
  for (const key of keys) {
    const lowerKey = key.toLowerCase().trim();
    if (lowerCaseKeyMap[lowerKey]) {
      return lowerCaseKeyMap[lowerKey];
    }
  }
  return null;
};

// Helper to parse numeric values from strings like "1,234.56" or "₫1,234"
const parseNumericValue = (value: any) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { filePath, shop_id } = await req.json();
    if (!filePath || !shop_id) {
      throw new Error("filePath and shop_id are required.");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);

    if (downloadError) throw downloadError;

    const workbook = XLSX.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
    };

    const reportsToUpdate = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2;

      const dateKey = findKey(row, ["Ngày", "Date", "Thời gian tạo đơn hàng", "Thời gian hủy", "Ngày hủy"]);
      if (!dateKey) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: "Không tìm thấy cột ngày (ví dụ: 'Ngày', 'Thời gian hủy')" });
        continue;
      }
      
      const report_date = new Date(row[dateKey]);
      if (isNaN(report_date.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Định dạng ngày không hợp lệ ở cột '${dateKey}'` });
        continue;
      }

      const formattedDate = report_date.toISOString().split('T')[0];

      const cancelled_revenue = parseNumericValue(row[findKey(row, ['Doanh thu bị hủy (₫)', 'Cancelled Revenue', 'Doanh thu hủy'])]);
      const cancelled_orders = parseNumericValue(row[findKey(row, ['Đơn hàng bị hủy', 'Cancelled Orders', 'Đơn hàng hủy'])]);

      if (cancelled_revenue !== null || cancelled_orders !== null) {
        reportsToUpdate.push({
          shop_id,
          report_date: formattedDate,
          cancelled_revenue,
          cancelled_orders,
        });
      } else {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: "Không tìm thấy dữ liệu doanh thu hoặc đơn hàng hủy." });
      }
    }

    if (reportsToUpdate.length > 0) {
      // Group updates by date to reduce DB calls
      const updatesByDate = reportsToUpdate.reduce((acc, report) => {
        if (!acc[report.report_date]) {
          acc[report.report_date] = { cancelled_revenue: 0, cancelled_orders: 0 };
        }
        acc[report.report_date].cancelled_revenue += report.cancelled_revenue || 0;
        acc[report.report_date].cancelled_orders += report.cancelled_orders || 0;
        return acc;
      }, {} as Record<string, { cancelled_revenue: number; cancelled_orders: number }>);

      const updatePromises = Object.entries(updatesByDate).map(([date, values]) => 
        supabaseAdmin
          .from("tiktok_comprehensive_reports")
          .update(values)
          .eq('shop_id', shop_id)
          .eq('report_date', date)
      );

      const updateResults = await Promise.all(updatePromises);
      
      let errorCount = 0;
      updateResults.forEach(res => {
        if (res.error) {
          console.error("Update error:", res.error);
          errorCount++;
        }
      });

      if (errorCount > 0) {
        throw new Error(`Không thể cập nhật ${errorCount} bản ghi ngày.`);
      }
      
      results.processedRows = reportsToUpdate.length;
    }

    // Clean up uploaded file
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(JSON.stringify({ ...results, message: `Xử lý hoàn tất! ${results.processedRows}/${results.totalRows} dòng đã được cập nhật.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});