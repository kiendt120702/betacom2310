// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    if (!callerProfile || callerProfile.role !== 'admin') {
      throw new Error("Forbidden: Only admins can bulk create users.");
    }

    const { users } = await req.json();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("User data must be a non-empty array.");
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { email: string; reason: string }[],
    };

    for (const userData of users) {
      const { email, password, full_name, role, team_id, work_type, phone } = userData;

      if (!email || !password || !full_name || !role) {
        results.failed++;
        results.errors.push({ email: email || 'N/A', reason: "Missing required fields (email, password, full_name, role)." });
        continue;
      }

      try {
        const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, role, team_id, work_type, phone },
        });

        if (createUserError) {
          throw createUserError;
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ email, reason: error.message });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});