// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as xlsx from "https://deno.land/x/sheetjs/xlsx.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// List of possible header names (lowercase)
const DATE_HEADERS = ["ngày hủy", "ngày", "thời gian hủy"];
const REVENUE_HEADERS = ["doanh thu hủy", "doanh số đơn hủy", "giá trị đơn hàng hủy", "doanh thu bị hủy"];

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
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      throw new Error("Missing file or shop_id.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false, defval: null });

    if (json.length === 0) {
      throw new Error("Excel file is empty or has an invalid format.");
    }

    const headers = Object.keys(json[0]).map(h => h.toLowerCase().trim());
    
    const dateHeader = headers.find(h => DATE_HEADERS.includes(h));
    const revenueHeader = headers.find(h => REVENUE_HEADERS.includes(h));

    const originalHeaders = Object.keys(json[0]);
    const originalDateHeader = originalHeaders.find(h => h.toLowerCase().trim() === dateHeader);
    const originalRevenueHeader = originalHeaders.find(h => h.toLowerCase().trim() === revenueHeader);

    if (!originalDateHeader || !originalRevenueHeader) {
      const missing = [];
      if (!originalDateHeader) missing.push(`'Ngày huỷ'/'Ngày'/'Thời gian hủy'`);
      if (!originalRevenueHeader) missing.push(`'Doanh thu huỷ'/'Doanh số đơn hủy'/'Giá trị đơn hàng hủy'/'Doanh thu bị hủy'`);
      throw new Error(`Could not find required columns: ${missing.join(' and ')}.`);
    }

    const results = {
      totalRows: json.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
    };

    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      const rowNum = i + 2; // Excel row number (1-based, plus header)

      const dateValue = row[originalDateHeader];
      const revenueValue = row[originalRevenueHeader];

      if (!dateValue) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: "Missing date value." });
        continue;
      }

      let reportDate: Date;
      if (dateValue instanceof Date) {
        reportDate = dateValue;
      } else if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
        if (isNaN(parsed.getTime())) {
          results.skippedCount++;
          results.skippedDetails.push({ row: rowNum, reason: `Invalid date format: ${dateValue}` });
          continue;
        }
        reportDate = parsed;
      } else {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Unsupported date type: ${typeof dateValue}` });
        continue;
      }
      
      const formattedDate = reportDate.toISOString().split('T')[0];
      const revenue = typeof revenueValue === 'string' ? parseFloat(revenueValue.replace(/[^0-9.-]+/g,"")) : revenueValue;

      if (revenue === null || isNaN(revenue)) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `Invalid revenue value: ${revenueValue}` });
        continue;
      }

      const { data: existingReport, error: fetchError } = await supabaseAdmin
        .from('tiktok_comprehensive_reports')
        .select('id, cancelled_revenue')
        .eq('shop_id', shopId)
        .eq('report_date', formattedDate)
        .maybeSingle();

      if (fetchError) {
        console.error(`Error fetching report for ${formattedDate}:`, fetchError);
        results.skippedCount++;
        results.skippedDetails.push({ row: rowNum, reason: `DB fetch error: ${fetchError.message}` });
        continue;
      }

      if (existingReport) {
        const { error: updateError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .update({ cancelled_revenue: revenue })
          .eq('id', existingReport.id);
        
        if (updateError) {
          console.error(`Error updating report for ${formattedDate}:`, updateError);
          results.skippedCount++;
          results.skippedDetails.push({ row: rowNum, reason: `DB update error: ${updateError.message}` });
        } else {
          results.processedRows++;
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .insert({
            shop_id: shopId,
            report_date: formattedDate,
            cancelled_revenue: revenue,
            total_revenue: 0,
            total_orders: 0,
          });
        
        if (insertError) {
          console.error(`Error inserting report for ${formattedDate}:`, insertError);
          results.skippedCount++;
          results.skippedDetails.push({ row: rowNum, reason: `DB insert error: ${insertError.message}` });
        } else {
          results.processedRows++;
        }
      }
    }

    return new Response(JSON.stringify({
      message: `Upload complete. Processed: ${results.processedRows}, Skipped: ${results.skippedCount}.`,
      ...results,
      skippedDetails: results.skippedDetails.slice(0, 20),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});