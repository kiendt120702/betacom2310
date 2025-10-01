// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { read, utils } from 'https://deno.land/x/xlsx/mod.ts';

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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shopId = formData.get('shop_id') as string;

    if (!file || !shopId) {
      return new Response(JSON.stringify({ error: 'Missing file or shop_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = utils.sheet_to_json(worksheet, { raw: false });

    const reportsToUpsert = jsonData.map(row => {
      const reportDate = new Date(row['Ngày']);
      // Adjust for timezone offset to get correct UTC date
      reportDate.setMinutes(reportDate.getMinutes() - reportDate.getTimezoneOffset());
      
      const cancelledRevenue = parseFloat(String(row['Doanh thu hủy (VND)'] || '0').replace(/[^0-9.-]+/g,""));
      const cancelledOrders = parseInt(String(row['Số đơn hủy'] || '0').replace(/[^0-9]+/g,""));

      if (isNaN(reportDate.getTime()) || isNaN(cancelledRevenue) || isNaN(cancelledOrders)) {
        console.warn('Skipping invalid row:', row);
        return null;
      }

      return {
        shop_id: shopId,
        report_date: reportDate.toISOString().split('T')[0],
        cancelled_revenue: cancelledRevenue,
        cancelled_orders: cancelledOrders,
      };
    }).filter(Boolean);

    if (reportsToUpsert.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid data found in the file.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error } = await supabaseClient
      .from('tiktok_comprehensive_reports')
      .upsert(reportsToUpsert, { onConflict: 'shop_id, report_date' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ message: `Đã cập nhật thành công ${reportsToUpsert.length} bản ghi doanh số hủy.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})