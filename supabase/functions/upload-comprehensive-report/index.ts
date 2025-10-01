// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping from various possible Excel column names to database column names
const columnMapping: { [key: string]: string } = {
  // Vietnamese names
  "ngày": "report_date",
  "doanh thu": "total_revenue",
  "doanh thu gộp": "total_revenue",
  "đơn hàng": "total_orders",
  "lượt click sản phẩm": "product_clicks",
  "lượt truy cập": "total_visits",
  "tỷ lệ chuyển đổi": "conversion_rate",
  "đơn hủy": "cancelled_orders",
  "doanh thu đơn hủy": "cancelled_revenue",
  "đơn trả hàng/hoàn tiền": "returned_orders",
  "doanh thu đơn trả hàng/hoàn tiền": "returned_revenue",
  "người mua": "total_buyers",
  "người mua mới": "new_buyers",
  "người mua hiện tại": "existing_buyers",
  "khách hàng tiềm năng": "potential_buyers",
  "tỷ lệ người mua quay lại": "buyer_return_rate",
  "giá trị trung bình mỗi đơn hàng": "average_order_value",

  // English names
  "date": "report_date",
  "total revenue": "total_revenue",
  "gross revenue": "total_revenue",
  "orders": "total_orders",
  "product clicks": "product_clicks",
  "visits": "total_visits",
  "conversion rate": "conversion_rate",
  "cancelled orders": "cancelled_orders",
  "cancelled revenue": "cancelled_revenue",
  "returned orders": "returned_orders",
  "returned revenue": "returned_revenue",
  "buyers": "total_buyers",
  "new buyers": "new_buyers",
  "existing buyers": "existing_buyers",
  "potential buyers": "potential_buyers",
  "buyer return rate": "buyer_return_rate",
  "average order value": "average_order_value",
};

// Function to normalize header names
const normalizeHeader = (header: string) => String(header).trim().toLowerCase().replace(/\s+/g, ' ');

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("File and shop_id are required.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    console.log("Raw JSON data from Excel (first 5 rows):", jsonData.slice(0, 5));

    if (jsonData.length === 0) {
      throw new Error("Excel file is empty or has an invalid format.");
    }

    const reportsToInsert = jsonData.map((row) => {
      const report: { [key: string]: any } = { shop_id };
      for (const key in row) {
        const normalizedKey = normalizeHeader(key);
        const dbColumn = columnMapping[normalizedKey];
        if (dbColumn) {
          let value = row[key];
          
          if (dbColumn === 'report_date' && value) {
            try {
              const date = new Date(value);
              // Check if date is valid
              if (!isNaN(date.getTime())) {
                // Format date to YYYY-MM-DD, adjusting for timezone offset
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date.getTime() - tzOffset);
                value = localDate.toISOString().split('T')[0];
              } else {
                value = null;
              }
            } catch (e) {
              value = null;
            }
          }
          
          if (typeof value === 'string' && dbColumn !== 'report_date') {
            // Remove currency symbols, commas, etc. for numeric columns
            const numericValue = parseFloat(value.replace(/[^0-9.-]+/g,""));
            if (!isNaN(numericValue)) {
              value = numericValue;
            }
          }
          
          report[dbColumn] = value;
        }
      }
      return report;
    }).filter(report => report.report_date);

    console.log("Processed data to be inserted (first 5 rows):", reportsToInsert.slice(0, 5));
    console.log(`Total records to process: ${reportsToInsert.length}`);

    if (reportsToInsert.length === 0) {
      throw new Error("No valid data found in the Excel file. Please check column headers.");
    }

    const { error } = await supabaseAdmin
      .from("shopee_comprehensive_reports")
      .upsert(reportsToInsert, { onConflict: 'shop_id,report_date' });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: `Successfully processed ${reportsToInsert.length} records.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});