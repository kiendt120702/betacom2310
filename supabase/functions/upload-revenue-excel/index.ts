
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
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
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shopId = formData.get('shop_id') as string;

    if (!file || !shopId) {
      throw new Error('Missing file or shop_id');
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true });
    
    // Find the "Đơn đã xác nhận" sheet
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Không tìm thấy sheet "${sheetName}" trong file Excel`);
    }

    // Convert sheet to JSON
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('File Excel không có dữ liệu hợp lệ');
    }

    // Get data from row 1 (index 1, as index 0 is headers)
    const dataRow = jsonData[1] as any[];
    
    // Extract date and revenue amount from row 1
    // Assuming date is in column A and revenue is in a specific column
    let revenueDate: Date | null = null;
    let revenueAmount: number = 0;

    // Try to find date and revenue from the row
    for (let i = 0; i < dataRow.length; i++) {
      const cellValue = dataRow[i];
      
      // Try to parse as date
      if (cellValue && !revenueDate) {
        const dateValue = new Date(cellValue);
        if (!isNaN(dateValue.getTime()) && dateValue.getFullYear() > 2020) {
          revenueDate = dateValue;
        }
      }
      
      // Try to parse as number (revenue)
      if (typeof cellValue === 'number' && cellValue > 0) {
        revenueAmount = Math.max(revenueAmount, cellValue);
      }
    }

    if (!revenueDate) {
      throw new Error('Không thể tìm thấy ngày hợp lệ trong dữ liệu');
    }

    if (revenueAmount <= 0) {
      throw new Error('Không thể tìm thấy doanh số hợp lệ trong dữ liệu');
    }

    // Format date for database
    const formattedDate = revenueDate.toISOString().split('T')[0];

    // Insert or update revenue data
    const { error: upsertError } = await supabaseClient
      .from('shop_revenue')
      .upsert({
        shop_id: shopId,
        revenue_date: formattedDate,
        revenue_amount: revenueAmount,
        uploaded_by: user.id,
      }, {
        onConflict: 'shop_id,revenue_date'
      });

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        message: `Đã cập nhật doanh số ${revenueAmount.toLocaleString('vi-VN')} VND cho ngày ${formattedDate}`,
        data: {
          shop_id: shopId,
          revenue_date: formattedDate,
          revenue_amount: revenueAmount,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing revenue upload:', error);
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
