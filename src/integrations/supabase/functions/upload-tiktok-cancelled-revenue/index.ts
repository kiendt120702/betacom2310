// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Column mapping for Excel headers (case-insensitive)
const ORDER_ID_COLUMN_CANDIDATES = ["mã đơn hàng", "order id", "order no"];
const ORDER_REFUND_AMOUNT_COLUMN_CANDIDATES = ["order refund amount", "số tiền hoàn lại", "doanh số hoàn tiền"];
const REPORT_DATE_COLUMN_CANDIDATES = ["ngày đặt hàng", "order created time", "order created at", "ngày báo cáo"];

// Helper to normalize header names
const normalizeHeader = (header: string) => String(header).toLowerCase().trim();

// Helper to find the correct header from candidates
const findHeader = (headers: string[], candidates: string[]): string | null => {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalizedHeaders.findIndex(h => h === candidate.toLowerCase());
    if (idx !== -1) {
      return headers[idx]; // Return original header name
    }
  }
  return null;
};

// Helper to sanitize and parse numbers
const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const numeric = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

serve(async (req) => {
  console.log("--- Edge Function 'upload-tiktok-cancelled-revenue' invoked at top level ---"); // Added this line
  console.log("Request Method:", req.method); // Added this line

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Authenticate user and check role
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error("Error: Authorization token required.");
      throw new Error("Unauthorized: Authorization token required.");
    }
    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) {
      console.error("Error: Invalid token or user not found.", callerError);
      throw new Error("Unauthorized: Invalid token or user not found.");
    }

    const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callerUser.id).single();
    if (!callerProfile || !['admin', 'trưởng phòng'].includes(callerProfile.role)) {
      console.error("Error: Forbidden - Only admins or department heads can upload reports. Caller role:", callerProfile?.role);
      throw new Error("Forbidden: Only admins or department heads can upload reports.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    console.log("--- Starting TikTok Cancelled Revenue Upload ---");
    console.log("Shop ID:", shopId);

    if (!file) {
      console.error("Error: No file uploaded.");
      throw new Error("No file uploaded.");
    }
    if (!shopId) {
      console.error("Error: Shop ID is required.");
      throw new Error("Shop ID is required.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    console.log("Raw JSON data from Excel (first 5 rows):", json.slice(0, 5));

    if (!json || json.length === 0) {
      console.error("Error: Excel file is empty or malformed.");
      throw new Error("Excel file is empty or malformed.");
    }

    const headers = Object.keys(json[0] || {});
    const orderIdHeader = findHeader(headers, ORDER_ID_COLUMN_CANDIDATES);
    const orderRefundAmountHeader = findHeader(headers, ORDER_REFUND_AMOUNT_COLUMN_CANDIDATES);
    const reportDateHeader = findHeader(headers, REPORT_DATE_COLUMN_CANDIDATES);

    if (!orderIdHeader) {
      console.error(`Error: Missing required column: ${ORDER_ID_COLUMN_CANDIDATES.join(' or ')}`);
      throw new Error(`Missing required column: ${ORDER_ID_COLUMN_CANDIDATES.join(' or ')}`);
    }
    if (!orderRefundAmountHeader) {
      console.error(`Error: Missing required column: ${ORDER_REFUND_AMOUNT_COLUMN_CANDIDATES.join(' or ')}`);
      throw new Error(`Missing required column: ${ORDER_REFUND_AMOUNT_COLUMN_CANDIDATES.join(' or ')}`);
    }
    if (!reportDateHeader) {
      console.error(`Error: Missing required column: ${REPORT_DATE_COLUMN_CANDIDATES.join(' or ')}`);
      throw new Error(`Missing required column: ${REPORT_DATE_COLUMN_CANDIDATES.join(' or ')}`);
    }

    console.log("Detected Headers:", { orderIdHeader, orderRefundAmountHeader, reportDateHeader });

    const dailyRefundAmounts = new Map<string, number>();

    for (const row of json) {
      const orderId = String(row[orderIdHeader]).trim();
      const refundAmount = parseNumber(row[orderRefundAmountHeader]);
      const reportDateRaw = row[reportDateHeader];

      if (!orderId || refundAmount === 0) {
        console.log(`Skipping row: Order ID '${orderId}' or Refund Amount '${refundAmount}' is invalid.`);
        continue;
      }

      let reportDate: string;
      if (reportDateRaw instanceof Date) {
        reportDate = reportDateRaw.toISOString().split('T')[0];
      } else if (typeof reportDateRaw === 'string') {
        try {
          reportDate = new Date(reportDateRaw).toISOString().split('T')[0];
        } catch {
          console.warn(`Invalid date format for order ${orderId}: ${reportDateRaw}. Skipping row.`);
          continue;
        }
      } else {
        console.warn(`Unsupported date type for order ${orderId}: ${typeof reportDateRaw}. Skipping row.`);
        continue;
      }

      console.log(`Processing row: Order ID: ${orderId}, Refund Amount: ${refundAmount}, Report Date: ${reportDate}`);

      const currentTotal = dailyRefundAmounts.get(reportDate) || 0;
      dailyRefundAmounts.set(reportDate, currentTotal + refundAmount);
    }

    console.log("Daily Refund Amounts before upsert:", Object.fromEntries(dailyRefundAmounts));

    const updates = [];
    for (const [date, amount] of dailyRefundAmounts.entries()) {
      updates.push({
        report_date: date,
        shop_id: shopId,
        cancelled_revenue: amount, // Store refund amount in cancelled_revenue
        updated_at: new Date().toISOString(),
      });
    }

    console.log("Updates array to be sent to database:", updates);

    // Upsert data into tiktok_comprehensive_reports
    const { error: upsertError } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .upsert(updates, { onConflict: 'report_date,shop_id' });

    if (upsertError) {
      console.error("Error upserting data:", upsertError);
      throw new Error(`Failed to update database: ${upsertError.message}`);
    }

    console.log("--- TikTok Cancelled Revenue Upload Completed Successfully ---");

    return new Response(JSON.stringify({ message: "TikTok cancelled revenue uploaded and processed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in upload-tiktok-cancelled-revenue function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});