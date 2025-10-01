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
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // Use raw: false to get formatted strings

    let processedRows = 0;
    const skippedDetails: { row: number; reason: string }[] = [];

    // Bắt đầu từ i = 1 để bỏ qua dòng dữ liệu đầu tiên (dòng thứ 2 trong sheet)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // Dòng trong Excel (1-based, +1 cho header)

      const reportDate = row["Created Time"];
      const cancelledRevenue = row["Order Refund Amount"];

      if (!reportDate || cancelledRevenue === undefined) {
        skippedDetails.push({ row: rowIndex, reason: "Thiếu cột 'Created Time' hoặc 'Order Refund Amount'." });
        continue;
      }

      let formattedDate;
      if (reportDate instanceof Date) {
        formattedDate = reportDate.toISOString().split('T')[0];
      } else if (typeof reportDate === 'string') {
        // Handle "dd/MM/yyyy HH:mm:ss" format
        const parts = reportDate.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts.map(p => parseInt(p, 10));
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
            // Create date in UTC to avoid timezone issues
            const dateObject = new Date(Date.UTC(year, month - 1, day));
            formattedDate = dateObject.toISOString().split('T')[0];
          }
        }
      }

      if (!formattedDate) {
        skippedDetails.push({ row: rowIndex, reason: `Định dạng ngày không hợp lệ: "${reportDate}"` });
        continue;
      }

      const updatePayload: { cancelled_revenue?: number } = {};
      if (typeof cancelledRevenue === 'number') {
        updatePayload.cancelled_revenue = cancelledRevenue;
      }

      if (Object.keys(updatePayload).length === 0) {
        skippedDetails.push({ row: rowIndex, reason: "Không có dữ liệu doanh thu hủy để cập nhật." });
        continue;
      }

      const { error } = await supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update(updatePayload)
        .eq("shop_id", shopId)
        .eq("report_date", formattedDate);

      if (error) {
        skippedDetails.push({ row: rowIndex, reason: `Lỗi CSDL: ${error.message}` });
      } else {
        processedRows++;
      }
    }

    const result = {
      message: `Xử lý hoàn tất. Cập nhật ${processedRows}/${rows.length - 1} dòng (bắt đầu từ dòng 3).`,
      totalRows: rows.length,
      processedRows,
      skippedCount: skippedDetails.length,
      skippedDetails: skippedDetails.slice(0, 20), // Limit details for response size
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