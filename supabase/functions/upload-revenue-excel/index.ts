// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import * as xlsx from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const columnMapping: { [key: string]: string } = {
  "ngày": "revenue_date",
  "date": "revenue_date",
  "doanh thu": "revenue_amount",
  "revenue": "revenue_amount",
};

const normalizeHeader = (header: string) => String(header).trim().toLowerCase().replace(/\s+/g, ' ');

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shop_id = formData.get("shop_id") as string;

    if (!file || !shop_id) {
      throw new Error("File and shop_id are required.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    console.log("Raw JSON data from Excel (first 5 rows):", jsonData.slice(0, 5));

    if (jsonData.length === 0) {
      throw new Error("Excel file is empty or has an invalid format.");
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token || undefined);

    const revenuesToInsert = jsonData.map((row) => {
      const revenue: { [key: string]: any } = { shop_id, uploaded_by: user?.id };
      for (const key in row) {
        const normalizedKey = normalizeHeader(key);
        const dbColumn = columnMapping[normalizedKey];
        if (dbColumn) {
          let value = row[key];
          if (dbColumn === 'revenue_date' && value) {
             try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date.getTime() - tzOffset);
                value = localDate.toISOString().split('T')[0];
              } else {
                value = null;
              }
            } catch (e) {
              value = null;
            }
          }
          if (dbColumn === 'revenue_amount' && typeof value === 'string') {
            const numericValue = parseFloat(value.replace(/[^0-9.-]+/g,""));
            if (!isNaN(numericValue)) {
              value = numericValue;
            }
          }
          revenue[dbColumn] = value;
        }
      }
      return revenue;
    }).filter(r => r.revenue_date && r.revenue_amount != null);

    console.log("Processed data to be inserted (first 5 rows):", revenuesToInsert.slice(0, 5));
    console.log(`Total records to process: ${revenuesToInsert.length}`);

    if (revenuesToInsert.length === 0) {
      throw new Error("No valid revenue data found in the Excel file. Check column headers ('Ngày', 'Doanh thu').");
    }

    const { error } = await supabaseAdmin
      .from("shopee_shop_revenue")
      .upsert(revenuesToInsert, { onConflict: 'shop_id,revenue_date' });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: `Successfully processed ${revenuesToInsert.length} revenue records.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});