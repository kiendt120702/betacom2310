// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { format } from "https://esm.sh/date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to parse numeric values from Vietnamese format (e.g., "1.234,56")
const parseVietnameseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

// Helper to parse percentage values (e.g., "3,05%")
const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  return parseFloat(value.replace('%', '').replace(',', '.'));
};

// Helper to parse date values from various formats, ensuring UTC to avoid timezone issues
const parseDate = (value: any): string | null => {
    console.log("Parsing date value:", value, "Type:", typeof value);
    
    if (!value) return null;
    
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
        // Try DD-MM-YYYY format first (your Excel format)
        let match = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const year = parseInt(match[3]);
            console.log("Parsed DD-MM-YYYY:", day, month + 1, year);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }

        // Try DD/MM/YYYY format
        match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const year = parseInt(match[3]);
            console.log("Parsed DD/MM/YYYY:", day, month + 1, year);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }

        // Try YYYY-MM-DD or YYYY/MM/DD
        match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const day = parseInt(match[3]);
            console.log("Parsed YYYY-MM-DD:", year, month + 1, day);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }
    }
    
    if (typeof value === 'number' && value > 0) {
        // Excel date number handling
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        console.log("Parsed Excel number to date:", date.toISOString().split('T')[0]);
        return date.toISOString().split('T')[0];
    }

    console.log("Could not parse date:", value);
    return null;
};


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let user;
  let file;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) throw new Error("Unauthorized");
    user = authUser;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Forbidden: User profile not found.");
    }

    const formData = await req.formData();
    file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;
    if (!file) throw new Error("File not provided");
    if (!shopId) throw new Error("Shop ID not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { 
      type: "array", 
      cellDates: false, // Keep as false to get the raw string values
      raw: false
    });
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const sheetData: any[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false, blankrows: false });

    console.log("Sheet data sample:", sheetData.slice(0, 5));

    if (sheetData.length < 2) {
      throw new Error("File không có đủ dữ liệu.");
    }

    let headerRowIndex = -1;
    const requiredHeaders = ["Ngày", "Tổng doanh số (VND)", "Tổng số đơn hàng"];
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i];
      const trimmedRow = row.map(cell => typeof cell === 'string' ? cell.trim() : cell);
      if (requiredHeaders.every(header => trimmedRow.includes(header))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error(`Không tìm thấy dòng tiêu đề hợp lệ. Dòng tiêu đề phải chứa: ${requiredHeaders.join(', ')}`);
    }

    const headers = sheetData[headerRowIndex];
    let dataStartIndex = headerRowIndex + 1;

    // Skip the numeric row if it exists after the header
    if (sheetData[dataStartIndex] && !isNaN(parseInt(sheetData[dataStartIndex][0], 10))) {
      dataStartIndex++;
    }

    if (sheetData.length <= dataStartIndex) {
      throw new Error("Không tìm thấy dòng dữ liệu nào sau dòng tiêu đề.");
    }

    const rowData = sheetData[dataStartIndex]; // Get the first data row
    console.log("First data row:", rowData);
    
    const rowObject = headers.reduce((obj, header, index) => {
      obj[header] = rowData[index];
      return obj;
    }, {});

    console.log("Row object:", rowObject);

    const reportDate = parseDate(rowObject["Ngày"]);
    console.log("Parsed report date:", reportDate);
    
    if (!reportDate) {
      throw new Error(`Không tìm thấy ngày hợp lệ trong dòng dữ liệu đầu tiên. Giá trị ngày: ${rowObject["Ngày"]}`);
    }

    console.log(`Processing report for shop ${shopId} on date ${reportDate}`);

    const reportDateObj = new Date(reportDate);
    const year = reportDateObj.getUTCFullYear();
    const month = reportDateObj.getUTCMonth();

    const startDate = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
    const endDate = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0];

    // Fetch any existing report for this shop in the same month to get goals
    const { data: existingReportForMonth } = await supabaseAdmin
        .from("comprehensive_reports")
        .select("feasible_goal, breakthrough_goal")
        .eq("shop_id", shopId)
        .gte("report_date", startDate)
        .lte("report_date", endDate)
        .or("feasible_goal.is.not.null,breakthrough_goal.is.not.null")
        .limit(1)
        .maybeSingle();

    const reportToUpsert = {
      shop_id: shopId,
      report_date: reportDate,
      total_revenue: parseVietnameseNumber(rowObject["Tổng doanh số (VND)"]) || 0,
      total_orders: parseInt(String(rowObject["Tổng số đơn hàng"]), 10) || 0,
      average_order_value: parseVietnameseNumber(rowObject["Doanh số trên mỗi đơn hàng"]) || 0,
      product_clicks: parseInt(String(rowObject["Lượt nhấp vào sản phẩm"]), 10) || 0,
      total_visits: parseInt(String(rowObject["Số lượt truy cập"]), 10) || 0,
      conversion_rate: parsePercentage(rowObject["Tỷ lệ chuyển đổi đơn hàng"]) || 0,
      cancelled_orders: parseInt(String(rowObject["Đơn đã hủy"]), 10) || 0,
      cancelled_revenue: parseVietnameseNumber(rowObject["Doanh số đơn hủy"]) || 0,
      returned_orders: parseInt(String(rowObject["Đơn đã hoàn trả / hoàn tiền"]), 10) || 0,
      returned_revenue: parseVietnameseNumber(rowObject["Doanh số các đơn Trả hàng/Hoàn tiền"]) || 0,
      total_buyers: parseInt(String(rowObject["số người mua"]), 10) || 0,
      new_buyers: parseInt(String(rowObject["số người mua mới"]), 10) || 0,
      existing_buyers: parseInt(String(rowObject["số người mua hiện tại"]), 10) || 0,
      potential_buyers: parseInt(String(rowObject["số người mua tiềm năng"]), 10) || 0,
      buyer_return_rate: parsePercentage(rowObject["Tỉ lệ quay lại của người mua"]) || 0,
      feasible_goal: existingReportForMonth?.feasible_goal,
      breakthrough_goal: existingReportForMonth?.breakthrough_goal,
    };

    console.log("Report to upsert:", reportToUpsert);

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert([reportToUpsert], { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    const isOverwrite = !!existingReportForMonth;
    const actionText = isOverwrite ? "ghi đè" : "nhập";
    const successDetails = { 
      message: `Đã ${actionText} báo cáo thành công cho ngày ${format(new Date(reportDate), 'dd/MM/yyyy')}.`,
      details: {
        shop_id: shopId,
        date: reportDate,
        overwritten: isOverwrite,
        action: actionText
      }
    };

    await supabaseAdmin.from("upload_history").insert({
      user_id: user.id,
      file_name: file.name,
      file_type: 'comprehensive_report',
      status: 'success',
      details: successDetails.details
    });

    return new Response(
      JSON.stringify(successDetails),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Function error:", error);
    if (user && file) {
      await supabaseAdmin.from("upload_history").insert({
        user_id: user.id,
        file_name: file.name,
        file_type: 'comprehensive_report',
        status: 'failure',
        details: { error: error.message }
      });
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});