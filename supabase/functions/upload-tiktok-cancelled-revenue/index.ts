// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Function to parse JS Date object into YYYY-MM-DD string
function parseDateToYYYYMMDD(dateInput: Date): string | null {
  if (!(dateInput instanceof Date) || isNaN(dateInput.getTime())) {
    return null;
  }
  // Using UTC methods to avoid timezone issues from server location
  const year = dateInput.getUTCFullYear();
  const month = (dateInput.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = dateInput.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

    const { filePath, shop_id } = await req.json();
    if (!filePath || !shop_id) {
      throw new Error("filePath and shop_id are required.");
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('report-uploads')
      .download(filePath);

    if (downloadError) throw downloadError;

    const workbook = XLSX.read(await fileData.arrayBuffer(), { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Use default header behavior (first row is header).
    // This will give us data from row 2 onwards.
    let jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // The user said data starts from row 3, and headers are on row 1.
    // This means we need to skip the data from row 2.
    // The jsonData array currently holds data from row 2, 3, 4...
    // So we slice it to start from the second element (which corresponds to row 3).
    if (jsonData.length > 0) {
        jsonData = jsonData.slice(1); // Skip the first data row (row 2 in Excel)
    }

    const results = {
      totalRows: jsonData.length,
      processedRows: 0,
      skippedCount: 0,
      skippedDetails: [] as { row: number; reason: string }[],
    };

    const revenueColumn = 'Order Refund Amount';
    const dateColumn = 'Created Time';

    if (jsonData.length > 0 && (jsonData[0][revenueColumn] === undefined || jsonData[0][dateColumn] === undefined)) {
        let missingColumns = [];
        if (jsonData[0][revenueColumn] === undefined) missingColumns.push(`'${revenueColumn}'`);
        if (jsonData[0][dateColumn] === undefined) missingColumns.push(`'${dateColumn}'`);
        throw new Error(`File không có các cột cần thiết: ${missingColumns.join(', ')}`);
    }

    const updatesByDate: { [date: string]: number } = {};

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 3; // Excel row number (1-based, plus 2 skipped rows)

      const refundAmount = row[revenueColumn];
      const createdTime = row[dateColumn];

      if (!createdTime) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: `Không có dữ liệu ở cột '${dateColumn}'` });
        continue;
      }
      
      const reportDate = parseDateToYYYYMMDD(createdTime);
      if (!reportDate) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: `Định dạng ngày không hợp lệ: ${createdTime}` });
        continue;
      }

      const amount = typeof refundAmount === 'string' ? parseFloat(refundAmount.replace(/[^0-9.-]+/g,"")) : refundAmount;
      if (refundAmount === null || refundAmount === undefined || isNaN(amount)) {
        results.skippedCount++;
        results.skippedDetails.push({ row: rowIndex, reason: `Giá trị hoàn tiền không hợp lệ: ${refundAmount}` });
        continue;
      }

      if (!updatesByDate[reportDate]) {
        updatesByDate[reportDate] = 0;
      }
      updatesByDate[reportDate] += amount;
    }
    
    results.processedRows = jsonData.length - results.skippedCount;

    for (const date in updatesByDate) {
      const totalCancelledRevenue = updatesByDate[date];

      const { data: existingReport, error: fetchError } = await supabaseAdmin
        .from('tiktok_comprehensive_reports')
        .select('id, cancelled_revenue')
        .eq('shop_id', shop_id)
        .eq('report_date', date)
        .maybeSingle();

      if (fetchError) {
        console.error(`Error fetching report for date ${date}:`, fetchError);
        continue;
      }

      if (existingReport) {
        const { error: updateError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .update({ cancelled_revenue: totalCancelledRevenue })
          .eq('id', existingReport.id);
        
        if (updateError) {
          console.error(`Error updating report for date ${date}:`, updateError);
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('tiktok_comprehensive_reports')
          .insert({
            shop_id: shop_id,
            report_date: date,
            cancelled_revenue: totalCancelledRevenue,
          });
        
        if (insertError) {
          console.error(`Error inserting report for date ${date}:`, insertError);
        }
      }
    }

    return new Response(JSON.stringify({
      ...results,
      message: `Xử lý hoàn tất. ${results.processedRows} dòng được xử lý, ${results.skippedCount} dòng bị bỏ qua.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});