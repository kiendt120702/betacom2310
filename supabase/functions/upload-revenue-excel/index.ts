/// <reference lib="deno.ns" />
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
    
    // Parse data starting from row 4 (Excel row number), using row 4 as header
    // range: 3 means start from 0-indexed row 3 (which is Excel row 4)
    // header: 1 means the first row in the specified range (row 4) is the header
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 3, header: 1, raw: false, defval: null });

    const revenueData: { shop_id: string; revenue_date: string; revenue_amount: number; uploaded_by: string; }[] = [];
    const dailyAggregates: { [key: string]: number } = {};

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const revenueDateRaw = row["Ngày"];
        const revenueAmountRaw = row["Tổng doanh số (VND)"];

        if (!revenueDateRaw || !revenueAmountRaw) {
            continue; // Skip rows with missing date or amount
        }

        let date: Date;
        // XLSX.utils.sheet_to_json with cellDates: true should parse dates into Date objects
        if (revenueDateRaw instanceof Date) {
            date = revenueDateRaw;
        } else {
            // Fallback for string dates like "06-08-2025"
            const parts = String(revenueDateRaw).split('-');
            if (parts.length === 3) {
                // Format is DD-MM-YYYY, construct as YYYY-MM-DD for Date constructor
                date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
                // Try direct parsing if other formats are possible
                date = new Date(revenueDateRaw);
            }
        }

        if (isNaN(date.getTime())) {
            console.warn(`Skipping row due to invalid date: ${revenueDateRaw}`);
            continue; // Skip if date is invalid
        }

        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Ensure revenue amount is parsed correctly, removing any thousands separators (dot and comma)
        const amount = parseFloat(String(revenueAmountRaw).replace(/\./g, '').replace(/,/g, ''));

        if (isNaN(amount)) {
            console.warn(`Skipping row due to invalid amount: ${revenueAmountRaw}`);
            continue; // Skip if amount is invalid
        }

        if (!dailyAggregates[dateString]) {
            dailyAggregates[dateString] = 0;
        }
        dailyAggregates[dateString] += amount;
    }

    Object.entries(dailyAggregates).forEach(([date, amount]) => {
        revenueData.push({
            shop_id: shopId,
            revenue_date: date,
            revenue_amount: amount,
            uploaded_by: user.id,
        });
    });

    if (revenueData.length === 0) {
        return new Response(JSON.stringify({ error: "No valid revenue data found in the file after processing." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error } = await supabaseAdmin.from("shop_revenue").upsert(revenueData, { onConflict: 'shop_id,revenue_date' });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Successfully uploaded ${revenueData.length} revenue records.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in upload-revenue-excel function:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});