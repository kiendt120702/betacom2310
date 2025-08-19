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
        // Try YYYY-MM-DD or YYYY/MM/DD
        let match = value.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const day = parseInt(match[3]);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }

        // Try DD-MM-YYYY or DD/MM/YYYY
        match = value.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
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

    if (profileError || !profile || !['admin', 'leader', 'chuyên viên'].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    const formData = await req.formData();
    file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;
    if (!file) throw new Error("File not provided");
    if (!shopId) throw new Error("Shop ID not provided");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: "array", cellDates: true });
    const sheetName = "Đơn đã xác nhận";
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const sheetData: any[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false, blankrows: false });

    if (sheetData.length < 2) {
      throw new Error("File không có đủ dữ liệu.");
    }

    let headerRowIndex = -1;
    const requiredHeaders = ["Ngày", "Tổng doanh số (VND)", "Tổng số đơn hàng"];
    for (let i = 0; i < Math.min(5, sheetData.length); i++) {
      const row = sheetData[i];
      if (requiredHeaders.every(header => row.includes(header))) {
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
    
    const reportsToUpsert = [];
    
    const firstReportDate = parseDate(sheetData[dataStartIndex][headers.indexOf("Ngày")]);
    if (!firstReportDate) {
        throw new Error("Could not determine month from Excel file.");
    }
    const month = firstReportDate.substring(0, 7);
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch existing reports for the month to preserve goals
    const { data: existingReportsForMonth } = await supabaseAdmin
        .from("comprehensive_reports")
        .select("report_date, feasible_goal, breakthrough_goal")
        .eq("shop_id", shopId)
        .gte("report_date", startDate)
        .lte("report_date", endDate);

    let monthGoals = { feasible_goal: null, breakthrough_goal: null };
    if (existingReportsForMonth && existingReportsForMonth.length > 0) {
        const firstReportWithGoal = existingReportsForMonth.find(r => r.feasible_goal != null || r.breakthrough_goal != null);
        if (firstReportWithGoal) {
            monthGoals = {
                feasible_goal: firstReportWithGoal.feasible_goal,
                breakthrough_goal: firstReportWithGoal.breakthrough_goal
            };
        }
    }

    for (let i = dataStartIndex; i < sheetData.length; i++) {
      const rowData = sheetData[i];
      const actualRowNumber = i + 1;
      
      if (!rowData || rowData.length === 0) {
        console.log(`Skipping empty row ${actualRowNumber}`);
        continue;
      }

      const rowObject = headers.reduce((obj, header, index) => {
        obj[header] = rowData[index];
        return obj;
      }, {});

      const reportDate = parseDate(rowObject["Ngày"]);

      if (!reportDate) {
        console.log(`Skipping row ${actualRowNumber}: no valid date found in 'Ngày' column.`);
        continue;
      }
      
      const report = {
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
        feasible_goal: monthGoals.feasible_goal,
        breakthrough_goal: monthGoals.breakthrough_goal,
      };
      
      reportsToUpsert.push(report);
    }

    if (reportsToUpsert.length === 0) {
        throw new Error("Không tìm thấy dữ liệu hợp lệ để nhập.");
    }

    console.log(`Found ${reportsToUpsert.length} valid reports to upsert`);

    const uniqueReportsMap = new Map<string, any>();
    for (const report of reportsToUpsert) {
      const key = `${report.shop_id}_${report.report_date}`;
      uniqueReportsMap.set(key, report);
    }
    const uniqueReportsToUpsert = Array.from(uniqueReportsMap.values());

    // Check if any of the records already exist to determine action
    const { data: existingReport } = await supabaseAdmin
      .from("comprehensive_reports")
      .select("id")
      .eq("shop_id", shopId)
      .eq("report_date", firstReportDate)
      .maybeSingle();
    
    const isOverwrite = !!existingReport;
    const actionText = isOverwrite ? "ghi đè" : "nhập";

    console.log(`Upserting ${uniqueReportsToUpsert.length} unique reports`);

    const { error: upsertError } = await supabaseAdmin
      .from("comprehensive_reports")
      .upsert(uniqueReportsToUpsert, { onConflict: "report_date,shop_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    const successDetails = { 
      message: `Đã cập nhật và nhập thành công ${uniqueReportsToUpsert.length} báo cáo.`,
      details: {
        shop_id: shopId,
        totalRowsProcessed: sheetData.length - dataStartIndex,
        validReports: reportsToUpsert.length,
        uniqueReports: uniqueReportsToUpsert.length,
        action: actionText,
      }
    };

    await supabaseAdmin.from("upload_history").insert({
      user_id: user.id,
      file_name: file.name,
      file_type: 'multi_day_comprehensive_report',
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
        file_type: 'multi_day_comprehensive_report',
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