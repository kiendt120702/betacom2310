// @ts-nocheck
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

  let user;
  let file;
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) throw new Error("Unauthorized");
    user = authUser;

    const formData = await req.formData();
    file = formData.get('file') as File;
    const shopId = formData.get('shop_id') as string;

    if (!file || !shopId) {
      throw new Error('Missing file or shop_id');
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true }); // cellDates to parse dates
    
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
        
        if (value instanceof Date) {
            return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
        }

        if (typeof value === 'string') {
            // Try YYYY-MM-DD or YYYY/MM/DD
            let match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1; // JS months are 0-indexed
                const day = parseInt(match[3]);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
                }
            }

            // Try DD-MM-YYYY or DD/MM/YYYY
            match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
            if (match) {
                const day = parseInt(match[1]);
                const month = parseInt(match[2]) - 1; // JS months are 0-indexed
                const year = parseInt(match[3]);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
                }
            }
        }
        
        if (typeof value === 'number' && value > 0) {
            // Excel date number handling
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const date = new Date(excelEpoch.getTime() + value * 86400000);
            return date.toISOString().split('T')[0];
        }

        return null;
    };

    // Process data starting from row 5 (index 4) - look for date pattern in columns
    const revenueRecords: Array<{ date: string; amount: number }> = [];
    
    // First, try to find the header row with dates (usually row 4, index 3)
    const headerRow = jsonData[3] as any[];
    const dateColumns: number[] = [];
    
    // Find columns that contain dates in the header
    if (headerRow) {
      for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
        const cellValue = headerRow[colIndex];
        const parsedDate = parseDate(cellValue);
        if (parsedDate) {
          dateColumns.push(colIndex);
        }
      }
    }
    
    // If we found date columns in header, extract data from those columns
    if (dateColumns.length > 0) {
      // Look for revenue data in subsequent rows (starting from row 5, index 4)
      for (let rowIndex = 4; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex] as any[];
        if (!row || row.length === 0) continue;
        
        // Extract revenue for each date column
        for (const colIndex of dateColumns) {
          const dateValue = parseDate(headerRow[colIndex]);
          const revenueValue = row[colIndex];
          
          if (dateValue && typeof revenueValue === 'number' && revenueValue > 0) {
            revenueRecords.push({
              date: dateValue,
              amount: revenueValue
            });
          }
        }
      }
    } else {
      // Fallback: look for date-revenue pairs in each row starting from row 5
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
    }

    if (revenueRecords.length === 0) {
      throw new Error('Không tìm thấy dữ liệu doanh số hợp lệ từ dòng 5 trở đi');
    }

    // Check if any of the records already exist to determine action
    const firstRecordDate = revenueRecords[0]?.date;
    const { data: existingRevenue } = await supabaseAdmin
      .from("shop_revenue")
      .select("id")
      .eq("shop_id", shopId)
      .eq("revenue_date", firstRecordDate)
      .maybeSingle();
    
    const isOverwrite = !!existingRevenue;
    const actionText = isOverwrite ? "ghi đè" : "nhập";

    // Insert or update all revenue records
    const upsertPromises = revenueRecords.map(record => 
      supabaseAdmin
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

    const successDetails = {
      message: `Đã cập nhật thành công ${revenueRecords.length} bản ghi doanh số`,
      details: {
        shop_id: shopId,
        records_count: revenueRecords.length,
        action: actionText,
      }
    };

    await supabaseAdmin.from("upload_history").insert({
      user_id: user.id,
      file_name: file.name,
      file_type: 'revenue_report',
      status: 'success',
      details: successDetails.details
    });

    return new Response(
      JSON.stringify(successDetails),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing revenue upload:', error);
    if (user && file) {
      await supabaseAdmin.from("upload_history").insert({
        user_id: user.id,
        file_name: file.name,
        file_type: 'revenue_report',
        status: 'failure',
        details: { error: error.message }
      });
    }
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