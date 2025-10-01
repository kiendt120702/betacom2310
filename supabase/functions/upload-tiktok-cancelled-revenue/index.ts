// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
// @ts-ignore
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check caller permissions
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Unauthorized");
    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) throw new Error("Unauthorized");
    const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callerUser.id).single();
    if (!callerProfile || !['admin', 'leader', 'trưởng phòng'].includes(callerProfile.role)) {
      throw new Error("Forbidden: Insufficient permissions.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      throw new Error("File and shop_id are required.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error("Excel file is empty or has an invalid format.");
    }

    const updates = data.map((row) => {
      const reportDate = new Date(row["Ngày"]);
      if (isNaN(reportDate.getTime())) {
        console.warn("Invalid date found in row:", row);
        return null;
      }
      
      // Adjust for timezone offset to get correct YYYY-MM-DD
      reportDate.setMinutes(reportDate.getMinutes() - reportDate.getTimezoneOffset());
      const formattedDate = reportDate.toISOString().split('T')[0];

      return {
        shop_id: shopId,
        report_date: formattedDate,
        cancelled_revenue: parseFloat(String(row["Doanh thu đơn hủy"]).replace(/[^0-9.-]+/g,"") || 0),
        cancelled_orders: parseInt(String(row["Đơn hủy"]).replace(/[^0-9]+/g,"") || 0, 10),
      };
    }).filter(Boolean);

    if (updates.length === 0) {
      throw new Error("No valid data to process in the file.");
    }

    // Upsert the data into the tiktok_comprehensive_reports table
    const { error } = await supabaseAdmin
      .from("tiktok_comprehensive_reports")
      .upsert(updates, { onConflict: "shop_id, report_date" });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: `Successfully processed ${updates.length} records.` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error processing file:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});