// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw userError;

    const { filePath, shop_id } = await req.json();
    if (!filePath || !shop_id) {
      throw new Error("filePath and shop_id are required.");
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);
    if (downloadError) throw downloadError;

    const workbook = xlsx.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // FIX: Skip the first 4 rows and start reading from the 5th row (index 4)
    const json: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false, range: 4 });

    const results = {
      totalRows: json.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
      message: "",
    };

    if (json.length === 0) {
      results.message = "File không có dữ liệu sau khi bỏ qua các dòng đầu.";
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const keys = Object.keys(json[0]);
    const findKey = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const key = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
        if (key) return key;
      }
      return null;
    };

    const keyMap = {
      date: findKey(['ngày', 'date']),
      totalRevenue: findKey(['tổng giá trị hàng hóa (₫)']),
      returnedRevenue: findKey(['hoàn tiền (₫)']),
      platformSubsidizedRevenue: findKey(['doanh thu có trợ cấp của nền tảng (₫)']),
      itemsSold: findKey(['số món bán ra']),
      totalBuyers: findKey(['khách hàng']),
      totalVisits: findKey(['lượt xem trang']),
      storeVisits: findKey(['lượt truy cập cửa hàng']),
      skuOrders: findKey(['đơn hàng sku']),
      totalOrders: findKey(['đơn hàng']),
      conversionRate: findKey(['tỷ lệ chuyển đổi']),
    };

    if (!keyMap.date) {
      results.skippedCount = json.length;
      results.skippedDetails = json.map((_, i) => ({
        row: i + 2,
        reason: `Không tìm thấy cột ngày ('Ngày' hoặc 'Date'). Các cột tìm thấy: ${keys.join(', ')}`
      }));
      results.message = `Xử lý thất bại. Không tìm thấy cột ngày trong file.`;
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const reportsToInsert = [];
    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      const rowNum = i + 6; // Excel rows are 1-based, +5 for header rows
      const reportDateValue = row[keyMap.date];

      if (!reportDateValue) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Giá trị ngày trống.` });
        continue;
      }

      let reportDate;
      if (reportDateValue instanceof Date) {
        reportDate = reportDateValue;
      } else if (typeof reportDateValue === "string") {
        // Handle YYYY-MM-DD format directly
        reportDate = new Date(reportDateValue);
      } else {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Định dạng ngày không được hỗ trợ: ${typeof reportDateValue}` });
        continue;
      }

      if (isNaN(reportDate.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Ngày không hợp lệ: ${reportDateValue}` });
        continue;
      }

      const parseCurrency = (val: any) => val ? parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0 : 0;
      const parseInteger = (val: any) => val ? parseInt(String(val).replace(/[^0-9]+/g, ""), 10) || 0 : 0;
      const parsePercentage = (val: any) => val ? parseFloat(String(val).replace("%", "")) || 0 : 0;

      const report = {
        shop_id,
        report_date: reportDate.toISOString().split("T")[0],
        total_revenue: keyMap.totalRevenue ? parseCurrency(row[keyMap.totalRevenue]) : 0,
        returned_revenue: keyMap.returnedRevenue ? parseCurrency(row[keyMap.returnedRevenue]) : 0,
        platform_subsidized_revenue: keyMap.platformSubsidizedRevenue ? parseCurrency(row[keyMap.platformSubsidizedRevenue]) : 0,
        items_sold: keyMap.itemsSold ? parseInteger(row[keyMap.itemsSold]) : 0,
        total_buyers: keyMap.totalBuyers ? parseInteger(row[keyMap.totalBuyers]) : 0,
        total_visits: keyMap.totalVisits ? parseInteger(row[keyMap.totalVisits]) : 0,
        store_visits: keyMap.storeVisits ? parseInteger(row[keyMap.storeVisits]) : 0,
        sku_orders: keyMap.skuOrders ? parseInteger(row[keyMap.skuOrders]) : 0,
        total_orders: keyMap.totalOrders ? parseInteger(row[keyMap.totalOrders]) : 0,
        conversion_rate: keyMap.conversionRate ? parsePercentage(row[keyMap.conversionRate]) : 0,
      };
      reportsToInsert.push(report);
    }

    if (reportsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .upsert(reportsToInsert, { onConflict: "shop_id, report_date" });
      if (insertError) throw insertError;
      results.processedRows = reportsToInsert.length;
    }

    results.message = `Xử lý hoàn tất. ${results.processedRows}/${results.totalRows} dòng đã được xử lý.`;
    await supabaseAdmin.storage.from("report-uploads").remove([filePath]);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});