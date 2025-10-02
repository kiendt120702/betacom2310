// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as xlsx from "https://deno.land/x/xlsx/mod.ts";

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

    // Authenticate user
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw userError;

    const { filePath, shop_id } = await req.json();
    if (!filePath || !shop_id) {
      throw new Error("filePath and shop_id are required.");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("report-uploads")
      .download(filePath);

    if (downloadError) throw downloadError;

    // Parse Excel file
    const workbook = xlsx.read(await fileData.arrayBuffer(), {
      type: "buffer",
      cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    const results = {
      totalRows: json.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
      message: "",
    };

    const reportsToInsert = [];

    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      const rowNum = i + 2; // Excel rows are 1-based, +1 for header

      // FIX: Use "Ngày" to get the date value
      const reportDateValue = row["Ngày"];
      if (!reportDateValue) {
        results.skippedCount++;
        results.skippedDetails.push({
          row: rowNum,
          reason: `Missing or invalid date value: '${reportDateValue}'`,
        });
        continue;
      }

      let reportDate;
      if (reportDateValue instanceof Date) {
        reportDate = reportDateValue;
      } else if (typeof reportDateValue === "string") {
        reportDate = new Date(
          reportDateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2")
        );
      } else {
        results.skippedCount++;
        results.skippedDetails.push({
          row: rowNum,
          reason: `Unsupported date format: ${typeof reportDateValue}`,
        });
        continue;
      }

      if (isNaN(reportDate.getTime())) {
        results.skippedCount++;
        results.skippedDetails.push({
          row: rowNum,
          reason: `Invalid date parsed: ${reportDateValue}`,
        });
        continue;
      }

      const parseCurrency = (val: any) => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };

      const parseInteger = (val: any) => {
        if (typeof val === "number") return Math.round(val);
        if (typeof val === "string") {
          const num = parseInt(val.replace(/[^0-9]+/g, ""), 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };

      const parsePercentage = (val: any) => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const num = parseFloat(val.replace("%", ""));
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };

      const report = {
        shop_id,
        report_date: reportDate.toISOString().split("T")[0],
        total_revenue: parseCurrency(row["Tổng giá trị hàng hóa (₫)"]),
        returned_revenue: parseCurrency(row["Hoàn tiền (₫)"]),
        platform_subsidized_revenue: parseCurrency(
          row["Doanh thu có trợ cấp của nền tảng (₫)"]
        ),
        items_sold: parseInteger(row["Số món bán ra"]),
        total_buyers: parseInteger(row["Khách hàng"]),
        total_visits: parseInteger(row["Lượt xem trang"]),
        store_visits: parseInteger(row["Lượt truy cập Cửa hàng"]),
        sku_orders: parseInteger(row["Đơn hàng SKU"]),
        total_orders: parseInteger(row["Đơn hàng"]),
        conversion_rate: parsePercentage(row["Tỷ lệ chuyển đổi"]),
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

    // Clean up uploaded file
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