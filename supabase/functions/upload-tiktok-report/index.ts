// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
// @ts-ignore
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      throw new Error("Shop ID và file là bắt buộc.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 4, raw: false, cellDates: true });

    if (!rows || rows.length === 0 || !rows[0]["Ngày"] || !rows[0]["Tổng giá trị hàng hóa (₫)"]) {
      throw new Error("Could not find required columns ('Ngày', 'Tổng giá trị hàng hóa (₫)') starting from row 5. Please check the Excel file format.");
    }

    let processedRows = 0;
    const skippedDetails: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 6;

      const reportDate = row["Ngày"];
      const totalRevenue = row["Tổng giá trị hàng hóa (₫)"];
      const platformSubsidizedRevenue = row["Doanh thu được trợ giá bởi nền tảng"];
      const itemsSold = row["Số món bán ra"];
      const totalBuyers = row["Khách hàng"];
      const totalVisits = row["Lượt xem trang"];
      const storeVisits = row["Lượt truy cập Cửa hàng"];
      const skuOrders = row["Đơn hàng SKU"];
      const totalOrders = row["Đơn hàng"];
      const conversionRate = row["Tỷ lệ chuyển đổi"];

      if (!reportDate) {
        skippedDetails.push({ row: rowIndex, reason: "Thiếu cột 'Ngày'." });
        continue;
      }

      let formattedDate;
      if (reportDate instanceof Date) {
        formattedDate = reportDate.toISOString().split('T')[0];
      } else if (typeof reportDate === 'string') {
        let dateObject: Date | null = null;
        const dateString = reportDate.trim();

        // Try parsing YYYY-MM-DD
        const ymdMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymdMatch) {
          const [, year, month, day] = ymdMatch.map(Number);
          dateObject = new Date(Date.UTC(year, month - 1, day));
        } else {
          // Try parsing DD/MM/YYYY
          const dmyMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (dmyMatch) {
            const [, day, month, year] = dmyMatch.map(Number);
            dateObject = new Date(Date.UTC(year, month - 1, day));
          }
        }

        if (dateObject && !isNaN(dateObject.getTime())) {
          formattedDate = dateObject.toISOString().split('T')[0];
        }
      }

      if (!formattedDate) {
        skippedDetails.push({ row: rowIndex, reason: `Định dạng ngày không hợp lệ: "${reportDate}"` });
        continue;
      }

      const reportData = {
        shop_id: shopId,
        report_date: formattedDate,
        total_revenue: typeof totalRevenue === 'number' ? totalRevenue : 0,
        platform_subsidized_revenue: typeof platformSubsidizedRevenue === 'number' ? platformSubsidizedRevenue : 0,
        items_sold: typeof itemsSold === 'number' ? itemsSold : 0,
        total_buyers: typeof totalBuyers === 'number' ? totalBuyers : 0,
        total_visits: typeof totalVisits === 'number' ? totalVisits : 0,
        store_visits: typeof storeVisits === 'number' ? storeVisits : 0,
        sku_orders: typeof skuOrders === 'number' ? skuOrders : 0,
        total_orders: typeof totalOrders === 'number' ? totalOrders : 0,
        conversion_rate: typeof conversionRate === 'number' ? conversionRate : 0,
      };

      const { error } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportData, { onConflict: 'shop_id, report_date' });

      if (error) {
        skippedDetails.push({ row: rowIndex, reason: `Lỗi CSDL: ${error.message}` });
      } else {
        processedRows++;
      }
    }

    const result = {
      message: `Xử lý hoàn tất. Cập nhật ${processedRows}/${rows.length} dòng.`,
      totalRows: rows.length,
      processedRows,
      skippedCount: skippedDetails.length,
      skippedDetails: skippedDetails.slice(0, 20),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});