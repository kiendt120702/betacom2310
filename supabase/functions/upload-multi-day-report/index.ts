
// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { format } from "https://esm.sh/date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const parseVietnameseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace('%', '').replace(',', '.'));
};

const parseDate = (value: any): string | null => {
    if (!value) return null;
    
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
        const match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
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
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date.toISOString().split('T')[0];
    }

    return null;
};

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

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'leader', 'chuyên viên'].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;
    if (!file) throw new Error("File not provided");
    if (!shopId) throw new Error("Shop ID not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true });
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const jsonData: any[][] = utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
      raw: false
    });
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error("File Excel không có đủ dữ liệu.");
    }

    console.log(`Total rows in Excel: ${jsonData.length}`);
    console.log(`First 5 rows:`, jsonData.slice(0, 5));

    // Try to find the header row automatically
    let headerRowIndex = -1;
    let headers: string[] = [];
    
    // Look for a row that contains "Ngày" in the first few rows
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && Array.isArray(row)) {
        const dateColumnIndex = row.findIndex(cell => 
          cell && typeof cell === 'string' && cell.toLowerCase().includes('ngày')
        );
        if (dateColumnIndex >= 0) {
          headerRowIndex = i;
          headers = row.map(h => h ? String(h).trim() : '');
          break;
        }
      }
    }

    // If no header found with "Ngày", assume first row with text data is header
    if (headerRowIndex === -1) {
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && Array.isArray(row) && row.some(cell => cell && typeof cell === 'string')) {
          headerRowIndex = i;
          headers = row.map(h => h ? String(h).trim() : '');
          break;
        }
      }
    }

    if (headerRowIndex === -1 || headers.length === 0) {
      throw new Error("Không tìm thấy dòng tiêu đề trong file Excel.");
    }

    console.log(`Headers found at row ${headerRowIndex + 1}:`, headers);

    // Get data rows after the header row
    const dataRows = jsonData.slice(headerRowIndex + 1);
    console.log(`Processing ${dataRows.length} data rows starting from row ${headerRowIndex + 2}`);
    
    const reportsToUpsert = [];
    const reportDates = new Set<string>();

    for (let i = 0; i < dataRows.length; i++) {
      const rowArray = dataRows[i];
      const actualRowNumber = i + headerRowIndex + 2; // Row number in Excel (1-indexed)
      
      // Skip completely empty rows
      if (!rowArray || (Array.isArray(rowArray) && rowArray.every(cell => cell === null || cell === undefined || cell === ''))) {
        console.log(`Skipping completely empty row ${actualRowNumber}`);
        continue;
      }

      const rowData: { [key: string]: any } = {};
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = rowArray[index];
        }
      });

      console.log(`Processing row ${actualRowNumber}:`, {
        firstCell: rowArray[0],
        secondCell: rowArray[1],
        thirdCell: rowArray[2]
      });

      // Try to find date in the first few columns
      let reportDate: string | null = null;
      for (let j = 0; j < Math.min(3, rowArray.length); j++) {
        const cellValue = rowArray[j];
        const parsedDate = parseDate(cellValue);
        if (parsedDate) {
          reportDate = parsedDate;
          break;
        }
      }

      if (!reportDate) {
        console.log(`Skipping row ${actualRowNumber}: no valid date found`);
        continue;
      }

      console.log(`Valid date found for row ${actualRowNumber}: ${reportDate}`);
      
      reportDates.add(reportDate);

      // Try to extract revenue and orders from the data
      let totalRevenue = 0;
      let totalOrders = 0;

      // Look for numeric values that could be revenue (larger numbers) and orders (smaller numbers)
      const numericValues = rowArray
        .map((cell, index) => ({ value: cell, index }))
        .filter(item => typeof item.value === 'number' || (typeof item.value === 'string' && item.value.match(/[\d,\.]+/)))
        .map(item => ({ 
          value: typeof item.value === 'number' ? item.value : parseVietnameseNumber(item.value),
          index: item.index
        }))
        .filter(item => !isNaN(item.value) && item.value >= 0);

      if (numericValues.length > 0) {
        // The largest number is likely revenue, smaller numbers could be orders
        const sortedValues = numericValues.sort((a, b) => b.value - a.value);
        totalRevenue = sortedValues[0].value;
        
        // Look for a reasonable order count (typically less than 10000)
        const orderValue = sortedValues.find(v => v.value < 10000 && v.value > 0);
        if (orderValue) {
          totalOrders = orderValue.value;
        }
      }

      const report = {
        shop_id: shopId,
        report_date: reportDate,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        product_clicks: 0,
        total_visits: 0,
        conversion_rate: 0,
        cancelled_orders: 0,
        cancelled_revenue: 0,
        returned_orders: 0,
        returned_revenue: 0,
        total_buyers: 0,
        new_buyers: 0,
        existing_buyers: 0,
        potential_buyers: 0,
        buyer_return_rate: 0,
      };
      
      console.log(`Adding report for row ${actualRowNumber}:`, {
        date: report.report_date,
        revenue: report.total_revenue,
        orders: report.total_orders
      });
      
      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ để nhập.");
    }

    console.log(`Found ${reportsToUpsert.length} valid reports to upsert`);

    // Determine month and year from first date
    const firstDate = new Date(Array.from(reportDates)[0]);
    const month = firstDate.getMonth() + 1;
    const year = firstDate.getFullYear();
    const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
    const monthEnd = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    console.log(`Deleting existing data for shop ${shopId} in month ${month}/${year}`);

    // Delete all existing data for this shop in this month before inserting new data
    const { error: deleteError } = await supabaseAdmin
      .from("comprehensive_reports")
      .delete()
      .eq("shop_id", shopId)
      .gte("report_date", monthStart)
      .lt("report_date", monthEnd);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      throw new Error(`Lỗi khi xóa dữ liệu cũ: ${deleteError.message}`);
    }

    const uniqueReportsMap = new Map<string, any>();
    for (const report of reportsToUpsert) {
      const key = `${report.shop_id}_${report.report_date}`;
      uniqueReportsMap.set(key, report);
    }
    const uniqueReportsToInsert = Array.from(uniqueReportsMap.values());

    console.log(`Inserting ${uniqueReportsToInsert.length} unique reports`);

    // Insert new data
    const { error: insertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .insert(uniqueReportsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        message: `Đã ghi đè và nhập thành công ${uniqueReportsToInsert.length} báo cáo cho tháng ${month}/${year} (tự động phát hiện cấu trúc dữ liệu).`,
        details: {
          month: `${month}/${year}`,
          totalRowsProcessed: dataRows.length,
          validReports: reportsToUpsert.length,
          uniqueReports: uniqueReportsToInsert.length,
          overwritten: true
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
