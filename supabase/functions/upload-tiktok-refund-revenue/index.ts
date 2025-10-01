// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs";

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
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (allRows.length < 3) {
      return new Response(JSON.stringify({ error: "File không có đủ dữ liệu (cần ít nhất 3 dòng)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers: string[] = allRows[1] as string[];
    const dataRows = allRows.slice(2);

    const refundAmountIndex = headers.findIndex(h => h === "Order Refund Amount");
    const createdTimeIndex = headers.findIndex(h => h === "Created Time");

    if (refundAmountIndex === -1 || createdTimeIndex === -1) {
      return new Response(JSON.stringify({ error: "Không tìm thấy các cột bắt buộc: 'Order Refund Amount' và 'Created Time'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refundsByDate = new Map<string, number>();

    for (const row of dataRows) {
      const createdTime = row[createdTimeIndex];
      const refundAmount = row[refundAmountIndex];

      if (createdTime && typeof refundAmount === 'number' && refundAmount > 0) {
        try {
          const datePart = String(createdTime).split(" ")[0];
          const [day, month, year] = datePart.split("/");
          if (day && month && year && year.length === 4) {
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            refundsByDate.set(formattedDate, (refundsByDate.get(formattedDate) || 0) + refundAmount);
          }
        } catch (e) {
          console.warn("Could not parse date:", createdTime);
        }
      }
    }

    if (refundsByDate.size === 0) {
      return new Response(JSON.stringify({ message: "Không tìm thấy dữ liệu hoàn tiền hợp lệ để cập nhật." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updatePromises = [];
    for (const [date, totalRefund] of refundsByDate.entries()) {
      const promise = supabaseAdmin
        .from("tiktok_comprehensive_reports")
        .update({ refund_revenue: totalRefund })
        .eq("shop_id", shopId)
        .eq("report_date", date);
      updatePromises.push(promise);
    }

    const results = await Promise.all(updatePromises);
    const failedUpdates = results.filter(r => r.error).length;
    const updatedCount = results.length - failedUpdates;

    if (failedUpdates > 0) {
        console.error(`Failed to update ${failedUpdates} records.`);
    }

    return new Response(JSON.stringify({ message: `Đã cập nhật thành công doanh số hoàn tiền cho ${updatedCount} ngày.` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});