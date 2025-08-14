// @ts-ignore
/// <reference lib="deno.ns" />
// @ts-ignore
/// <reference types="https://esm.sh/@supabase/supabase-js@2.50.0" />
// @ts-ignore
/// <reference types="https://esm.sh/xlsx@0.18.5" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase/supabase-js@2.50.0";
// @ts-ignore
import { readXLSX, utils } from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: Replace with specific domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized: User not authenticated');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shopId = formData.get('shop_id') as string;

    if (!file || !shopId) {
      throw new Error('Missing file or shop_id in request');
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = readXLSX(new Uint8Array(arrayBuffer));
    
    // Find the "Đơn đã xác nhận" sheet
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in the Excel file.`);
    }

    // Convert sheet to JSON, reading raw values and dates
    // header: 1 means first row is header, then data starts from second row
    const json: any[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: null });
    
    if (!json || json.length < 2) { // Need at least header row and one data row
      throw new Error('Excel file does not contain valid data or is empty.');
    }

    const headers = json[0]; // First row is headers
    const dataRow = json[1]; // Second row is the data we need

    if (!headers || !dataRow) {
        throw new Error('Could not extract headers or data row from Excel sheet.');
    }

    // Map column names to their index for easy access
    const headerMap: { [key: string]: number } = {};
    headers.forEach((header: string, index: number) => {
        headerMap[header.trim()] = index;
    });

    // Helper to get value by header name
    const getValue = (headerName: string, type: 'string' | 'number' | 'date' | 'percentage'): any => {
        const index = headerMap[headerName.trim()];
        if (index === undefined || dataRow[index] === null) {
            // For numeric fields, return 0 if missing, otherwise null for others
            if (type === 'number' || type === 'percentage') return 0;
            return null;
        }
        let value = dataRow[index];

        switch (type) {
            case 'string':
                return String(value).trim();
            case 'number':
                // Remove commas, replace decimal comma with dot, then parse
                const numValue = parseFloat(String(value).replace(/,/g, '').replace(/\./g, '')); // Handle both comma and dot as thousands separators
                return isNaN(numValue) ? 0 : numValue;
            case 'date':
                // XLSX.utils.sheet_to_json with cellDates: true should handle this
                // Ensure it's a valid Date object, otherwise try parsing
                if (value instanceof Date) return value;
                try {
                    const parsedDate = new Date(value);
                    return isNaN(parsedDate.getTime()) ? null : parsedDate;
                } catch {
                    return null;
                }
            case 'percentage':
                // Remove '%' sign, replace comma with dot, then parse and divide by 100
                const percentValue = parseFloat(String(value).replace(/%/g, '').replace(/,/g, '.'));
                return isNaN(percentValue) ? 0 : (percentValue / 100);
            default:
                return value;
        }
    };

    // Extract data based on column names
    const metricDate = getValue("Ngày", "date");
    const totalSalesVND = getValue("Tổng doanh số (VND)", "number");
    const totalOrders = getValue("Tổng số đơn hàng", "number");
    const salesPerOrder = getValue("Doanh số trên mỗi đơn hàng", "number");
    const productClicks = getValue("Lượt nhấp vào sản phẩm", "number");
    const totalVisits = getValue("Số lượt truy cập", "number");
    const conversionRate = getValue("Tỷ lệ chuyển đổi đơn hàng", "percentage");
    const cancelledOrders = getValue("Đơn đã hủy", "number");
    const cancelledSalesVND = getValue("Doanh số đơn hủy", "number");
    const returnedRefundedOrders = getValue("Đơn đã hoàn trả / hoàn tiền", "number");
    const returnedRefundedSalesVND = getValue("Doanh số các đơn Trả hàng/Hoàn tiền", "number");
    const totalBuyers = getValue("số người mua", "number");
    const newBuyers = getValue("số người mua mới", "number");
    const currentBuyers = getValue("số người mua hiện tại", "number");
    const potentialBuyers = getValue("số người mua tiềm năng", "number");
    const buyerReturnRate = getValue("Tỉ lệ quay lại của người mua", "percentage");

    if (!metricDate) {
        throw new Error('Missing or invalid "Ngày" column data.');
    }

    // Prepare data for upsert
    const dailyMetricsData = {
      shop_id: shopId,
      metric_date: metricDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      total_sales_vnd: totalSalesVND,
      total_orders: totalOrders,
      sales_per_order: salesPerOrder,
      product_clicks: productClicks,
      total_visits: totalVisits,
      conversion_rate: conversionRate,
      cancelled_orders: cancelledOrders,
      cancelled_sales_vnd: cancelledSalesVND,
      returned_refunded_orders: returnedRefundedOrders,
      returned_refunded_sales_vnd: returnedRefundedSalesVND,
      total_buyers: totalBuyers,
      new_buyers: newBuyers,
      current_buyers: currentBuyers,
      potential_buyers: potentialBuyers,
      buyer_return_rate: buyerReturnRate,
      uploaded_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Upsert data into daily_shop_metrics table
    const { error: upsertError } = await supabaseClient
      .from('daily_shop_metrics')
      .upsert(dailyMetricsData, { onConflict: 'shop_id,metric_date' });

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      throw new Error(`Failed to save daily metrics: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: `Đã cập nhật chỉ số doanh thu cho shop ${shopId} vào ngày ${dailyMetricsData.metric_date}`,
        data: dailyMetricsData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in upload-daily-metrics-excel function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});