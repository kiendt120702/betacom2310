// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to parse dd/MM/yyyy HH:mm:ss or Date object into yyyy-MM-dd
function parseDate(dateValue: string | Date): string | null {
  try {
    if (dateValue instanceof Date) {
      // It's already a Date object
      const year = dateValue.getUTCFullYear();
      const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    if (typeof dateValue === 'string') {
      const parts = dateValue.split(' ')[0].split('/');
      if (parts.length !== 3) return null;
      const [day, month, year] = parts;
      if (day?.length !== 2 || month?.length !== 2 || year?.length !== 4) return null;
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    return null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shopId = formData.get('shop_id') as string;

    if (!file || !shopId) {
      return new Response(JSON.stringify({ error: 'Missing file or shop_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get all data as array of arrays
    const allData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    if (allData.length < 3) {
      throw new Error("File must have at least 3 rows (header on row 2, data from row 3).");
    }

    // Assuming header is on the second row (index 1)
    const headerRow: string[] = allData[1].map(String);
    const dataRows = allData.slice(2); // Data starts from the third row

    const refundAmountIndex = headerRow.findIndex(h => h && h.trim() === "Order Refund Amount");
    const createdTimeIndex = headerRow.findIndex(h => h && h.trim() === "Created Time");

    if (refundAmountIndex === -1 || createdTimeIndex === -1) {
      throw new Error("Required columns 'Order Refund Amount' or 'Created Time' not found on the second row of the file.");
    }

    const dailyCancelledRevenue = new Map<string, number>();

    for (const row of dataRows) {
      const createdTime = row[createdTimeIndex];
      const refundAmount = row[refundAmountIndex];

      const reportDate = parseDate(createdTime);
      const amount = Number(refundAmount);

      if (reportDate && !isNaN(amount) && amount > 0) {
        dailyCancelledRevenue.set(reportDate, (dailyCancelledRevenue.get(reportDate) || 0) + amount);
      }
    }

    if (dailyCancelledRevenue.size === 0) {
      return new Response(JSON.stringify({ message: 'No valid cancelled revenue data found to update.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const upsertData = Array.from(dailyCancelledRevenue.entries()).map(([date, amount]) => ({
      shop_id: shopId,
      report_date: date,
      cancelled_revenue: amount,
    }));

    const { error } = await supabaseAdmin
      .from('tiktok_comprehensive_reports')
      .upsert(upsertData, { onConflict: 'shop_id, report_date' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ message: `Successfully updated cancelled revenue for ${upsertData.length} day(s).` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})