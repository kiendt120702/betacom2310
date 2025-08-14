/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shopId = formData.get("shop_id") as string;

    if (!file || !shopId) {
      return new Response(JSON.stringify({ error: "File and shop_id are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    
    const sheetName = "Đơn đã xác nhận";
    if (!workbook.SheetNames.includes(sheetName)) {
        return new Response(JSON.stringify({ error: `Sheet '${sheetName}' not found in the Excel file.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    let revenueData = [];

    if (jsonData.length > 0 && jsonData[0]['Ngày']) {
        // Handle daily summary format
        revenueData = jsonData.map(row => {
            const revenueDate = row["Ngày"];
            const revenueAmount = row["Tổng doanh số (VND)"];
            if (!revenueDate || !revenueAmount || isNaN(new Date(revenueDate).getTime()) || isNaN(parseFloat(revenueAmount))) {
                return null;
            }
            return {
                shop_id: shopId,
                revenue_date: new Date(revenueDate).toISOString().split('T')[0],
                revenue_amount: parseFloat(revenueAmount),
                uploaded_by: user.id,
            };
        }).filter(Boolean);
    } else if (jsonData.length > 0 && (jsonData[0]['Thời gian đơn hàng được thanh toán'] || jsonData[0]['Thời gian']) && jsonData[0]['Tổng doanh số (VND)']) {
        // Handle detailed order format OR hourly breakdown format
        const dailyAggregates: { [key: string]: number } = {};
        const timestampKey = jsonData[0]['Thời gian đơn hàng được thanh toán'] ? 'Thời gian đơn hàng được thanh toán' : 'Thời gian';

        jsonData.forEach(row => {
            const timestampStr = row[timestampKey];
            const revenueAmount = row["Tổng doanh số (VND)"];

            if (!timestampStr || !revenueAmount || isNaN(parseFloat(String(revenueAmount).replace(/,/g, '')))) {
                return;
            }

            let date;
            const parsedDate = new Date(timestampStr);
            if (!isNaN(parsedDate.getTime())) {
                date = parsedDate;
            } else {
                const parts = String(timestampStr).split(' ');
                if (parts.length < 2) return;
                const dateParts = parts[1].split('-');
                if (dateParts.length < 3) return;
                
                const isoDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                date = new Date(isoDateString);
            }

            if (isNaN(date.getTime())) return;

            const dateString = date.toISOString().split('T')[0];
            if (!dailyAggregates[dateString]) {
                dailyAggregates[dateString] = 0;
            }
            dailyAggregates[dateString] += parseFloat(String(revenueAmount).replace(/,/g, ''));
        });

        revenueData = Object.entries(dailyAggregates).map(([date, amount]) => ({
            shop_id: shopId,
            revenue_date: date,
            revenue_amount: amount,
            uploaded_by: user.id,
        }));
    } else {
        return new Response(JSON.stringify({ error: "Unrecognized Excel format. Please ensure the sheet 'Đơn đã xác nhận' contains required columns like 'Ngày' or 'Thời gian'." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (revenueData.length === 0) {
        return new Response(JSON.stringify({ error: "No valid revenue data found in the file." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error } = await supabaseAdmin.from("shop_revenue").upsert(revenueData, { onConflict: 'shop_id,revenue_date' });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Successfully uploaded ${revenueData.length} revenue records.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});