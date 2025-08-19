/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { readXLSX, utils } from "https://deno.land/x/xlsx@0.18.5/mod.ts";

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
    const workbook = readXLSX(new Uint8Array(arrayBuffer));
    
    // Find the "Đơn đã xác nhận" sheet
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Không tìm thấy sheet "${sheetName}" trong file Excel`);
    }

    // Convert sheet to JSON
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length < 5) {
      throw new Error('File Excel không có dữ liệu hợp lệ (cần ít nhất 5 dòng)');
    }

    // Function to parse date from various formats
    const parseDate = (value: any): string | null => {
      if (!value) return null;
      
      if (typeof value === 'string') {
        // Handle DD-MM-YYYY format
        const specialFormatMatch = value.match(/^(\d{1,2}-\d{1,2}-\d{4})/);
        if (specialFormatMatch) {
          const datePart = specialFormatMatch[1];
          const parts = datePart.split('-');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Convert to 0-based month
            const year = parseInt(parts[2]);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
                day >= 1 && day <= 31 && month >= 0 && month <= 11) {
              const date = new Date(Date.UTC(year, month, day));
              return date.toISOString().split('T')[0];
            }
          }
        }
        
        // Handle other formats like DD/MM/YYYY or DD-MM-YYYY
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
          let day: number, month: number, year: number;
          
          // Assume DD/MM/YYYY or DD-MM-YYYY format first
          if (parts[2].length === 4) {
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1; // Convert to 0-based
            year = parseInt(parts[2]);
          } else if (parts[0].length === 4) {
            // YYYY/MM/DD or YYYY-MM-DD format
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1; // Convert to 0-based
            day = parseInt(parts[2]);
          } else {
            return null;
          }
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
              day >= 1 && day <= 31 && month >= 0 && month <= 11) {
            const date = new Date(Date.UTC(year, month, day));
            return date.toISOString().split('T')[0];
          }
        }
      }
      
      if (typeof value === 'number') {
        // Excel date number
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (value - 1) * 86400000);
        return date.toISOString().split('T')[0];
      }
      
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      
      return null;
    };

    // Process data starting from row 5 (index 4)
    const revenueRecords: Array<{ date: string; amount: number }> = [];
    
    for (let rowIndex = 4; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex] as any[];
      if (!row || row.length === 0) continue;
      
      let dateValue: string | null = null;
      let revenueAmount: number = 0;
      
      // Try to find date and revenue in this row
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = row[colIndex];
        
        // Try to parse as date (usually in first columns)
        if (cellValue && !dateValue) {
          dateValue = parseDate(cellValue);
        }
        
        // Try to parse as revenue (usually numbers > 0)
        if (typeof cellValue === 'number' && cellValue > 0) {
          revenueAmount = Math.max(revenueAmount, cellValue);
        }
      }
      
      // If we found both date and revenue, add to records
      if (dateValue && revenueAmount > 0) {
        revenueRecords.push({
          date: dateValue,
          amount: revenueAmount
        });
      }
    }

    if (revenueRecords.length === 0) {
      throw new Error('Không tìm thấy dữ liệu doanh số hợp lệ từ dòng 5 trở đi');
    }

    // Insert or update all revenue records
    const upsertPromises = revenueRecords.map(record => 
      supabaseClient
        .from('shop_revenue')
        .upsert({
          shop_id: shopId,
          revenue_date: record.date,
          revenue_amount: record.amount,
          uploaded_by: user.id,
        }, {
          onConflict: 'shop_id,revenue_date'
        })
    );

    const results = await Promise.all(upsertPromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(`Lỗi khi cập nhật ${errors.length} bản ghi: ${errors[0].error?.message}`);
    }

    return new Response(
      JSON.stringify({
        message: `Đã cập nhật thành công ${revenueRecords.length} bản ghi doanh số`,
        data: {
          shop_id: shopId,
          records_count: revenueRecords.length,
          records: revenueRecords.slice(0, 5), // Show first 5 records as preview
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