// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
// @ts-ignore
import * as xlsx from "https://deno.land/x/xlsx/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
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

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // TikTok reports often have headers on the second row
    const data: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 1, raw: false });
    
    if (data.length < 1) {
      return new Response(JSON.stringify({ error: 'No data found in Excel file.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const headers: string[] = data[0].map((h: any) => String(h).trim());
    
    // Find the correct column indices based on possible headers
    const refundAmountHeaderVariants = [
      "order total refund amount of all returned skus.",
      "Order Refund Amount",
      "Tổng số tiền"
    ];
    const cancelledTimeHeaderVariants = [
      "the time when the order status changes to cancelled.",
      "Created Time",
      "Thời gian hủy"
    ];

    let refundAmountIndex = -1;
    for (const variant of refundAmountHeaderVariants) {
      const index = headers.findIndex(h => h.toLowerCase().includes(variant.toLowerCase()));
      if (index !== -1) {
        refundAmountIndex = index;
        break;
      }
    }

    let cancelledTimeIndex = -1;
    for (const variant of cancelledTimeHeaderVariants) {
      const index = headers.findIndex(h => h.toLowerCase().includes(variant.toLowerCase()));
      if (index !== -1) {
        cancelledTimeIndex = index;
        break;
      }
    }

    if (refundAmountIndex === -1 || cancelledTimeIndex === -1) {
      const missing = [];
      if (refundAmountIndex === -1) missing.push(`'Order Refund Amount' or 'Tổng số tiền' or 'order total refund amount of all returned skus.'`);
      if (cancelledTimeIndex === -1) missing.push(`'Created Time' or 'Thời gian hủy' or 'the time when the order status changes to cancelled.'`);
      
      return new Response(JSON.stringify({ 
        error: `Required columns ${missing.join(' and ')} not found on the second row. Found headers: [${headers.join(', ')}]` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cancelledDataByDate: { [date: string]: { cancelled_revenue: number, cancelled_orders: number } } = {};
    const rows = data.slice(1);

    for (const row of rows) {
      const cancelledTimeValue = row[cancelledTimeIndex];
      const refundAmountValue = row[refundAmountIndex];

      if (!cancelledTimeValue || refundAmountValue === undefined || refundAmountValue === null) {
        continue;
      }

      let cancelledDate;
      if (cancelledTimeValue instanceof Date) {
        cancelledDate = cancelledTimeValue;
      } else if (typeof cancelledTimeValue === 'string') {
        // Handle formats like 'DD-MM-YYYY HH:mm:ss'
        cancelledDate = new Date(cancelledTimeValue.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
      } else {
        continue;
      }

      if (isNaN(cancelledDate.getTime())) {
        continue;
      }

      const reportDate = cancelledDate.toISOString().split('T')[0];
      const refundAmount = parseFloat(String(refundAmountValue).replace(/[^0-9.-]+/g,""));

      if (!isNaN(refundAmount)) {
        if (!cancelledDataByDate[reportDate]) {
          cancelledDataByDate[reportDate] = { cancelled_revenue: 0, cancelled_orders: 0 };
        }
        cancelledDataByDate[reportDate].cancelled_revenue += refundAmount;
        cancelledDataByDate[reportDate].cancelled_orders += 1;
      }
    }

    const updates = Object.entries(cancelledDataByDate).map(([date, values]) => {
      return supabaseClient
        .from('tiktok_comprehensive_reports')
        .update({
          cancelled_revenue: values.cancelled_revenue,
          cancelled_orders: values.cancelled_orders,
        })
        .eq('shop_id', shopId)
        .eq('report_date', date);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error("Errors updating reports:", errors.map(e => e.error));
      // Check if the error is because the record doesn't exist
      const insertPromises = [];
      for (const [date, values] of Object.entries(cancelledDataByDate)) {
        const { data: existing, error } = await supabaseClient
          .from('tiktok_comprehensive_reports')
          .select('id')
          .eq('shop_id', shopId)
          .eq('report_date', date)
          .maybeSingle();
        
        if (!existing && !error) {
          insertPromises.push(
            supabaseClient.from('tiktok_comprehensive_reports').insert({
              shop_id: shopId,
              report_date: date,
              cancelled_revenue: values.cancelled_revenue,
              cancelled_orders: values.cancelled_orders,
            })
          );
        }
      }
      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
      }
    }

    return new Response(JSON.stringify({ message: `Successfully updated cancelled revenue for ${Object.keys(cancelledDataByDate).length} dates.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})