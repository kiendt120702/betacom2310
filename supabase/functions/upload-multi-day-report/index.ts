// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to parse numeric values from strings like "1,234.56" or "50%"
const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === "-") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]+/g, "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
};

// Function to format JS Date to 'YYYY-MM-DD'
const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      return new Response(JSON.stringify({ error: "Missing file or shop_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (json.length === 0) {
      return new Response(JSON.stringify({ error: "No data found in the Excel file." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reportsToUpsert = json.map((row) => {
      const reportDate = row["Ngày"];
      if (!reportDate) return null;

      let formattedDate;
      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        formattedDate = formatDate(reportDate);
      } else if (typeof reportDate === 'string') {
        const parts = reportDate.match(/(\d+)/g);
        if (parts && parts.length === 3) {
          // Assuming DD/MM/YYYY or MM/DD/YYYY - trying to be flexible
          const [d, m, y] = parts.map(p => parseInt(p, 10));
          let parsed;
          if (y > 2000 && m <= 12 && d <= 31) { // Likely DD/MM/YYYY
            parsed = new Date(Date.UTC(y, m - 1, d));
          } else if (y > 2000 && d <= 12 && m <= 31) { // Likely MM/DD/YYYY
            parsed = new Date(Date.UTC(y, d - 1, m));
          }
          if (parsed && !isNaN(parsed.getTime())) {
            formattedDate = formatDate(parsed);
          }
        }
      }

      if (!formattedDate) {
        console.warn("Skipping row due to invalid date:", reportDate);
        return null;
      }

      return {
        shop_id: shopId,
        report_date: formattedDate,
        total_revenue: parseNumber(row["Doanh thu"]),
        total_orders: parseNumber(row["Đơn hàng"]),
        conversion_rate: parseNumber(row["Tỉ lệ chuyển đổi"]),
        total_visits: parseNumber(row["Lượt truy cập"]),
        product_clicks: parseNumber(row["Lượt click sản phẩm"]),
        total_buyers: parseNumber(row["Người mua"]),
        cancelled_orders: parseNumber(row["Đơn hủy"]),
        cancelled_revenue: parseNumber(row["Doanh thu đơn hủy"]),
        returned_orders: parseNumber(row["Trả hàng/Hoàn tiền"]),
        returned_revenue: parseNumber(row["Doanh thu Trả hàng/Hoàn tiền"]),
        new_buyers: parseNumber(row["Người mua mới"]),
        existing_buyers: parseNumber(row["Người mua hiện tại"]),
      };
    }).filter(Boolean);

    if (reportsToUpsert.length === 0) {
      return new Response(JSON.stringify({ error: "No valid data to process. Check date format in your file." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabaseAdmin
      .from("shopee_comprehensive_reports")
      .upsert(reportsToUpsert, { onConflict: "shop_id, report_date" });

    if (error) {
      console.error("Supabase upsert error:", error);
      if (error.message.includes("invalid input syntax for type date")) {
        return new Response(JSON.stringify({ error: "Invalid date format found in file. Please ensure dates are in DD/MM/YYYY format." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    const firstReportMonth = reportsToUpsert[0].report_date.substring(0, 7);

    return new Response(JSON.stringify({ 
      message: `Successfully uploaded and processed ${reportsToUpsert.length} reports.`,
      month: firstReportMonth,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in function:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});