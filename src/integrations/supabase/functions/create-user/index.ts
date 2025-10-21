// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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
    if (!token) {
      return new Response(JSON.stringify({ error: "Authorization token required" }), { status: 401, headers: corsHeaders });
    }

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), { status: 401, headers: corsHeaders });
    }

    let { data: callerProfile } = await supabaseAdmin
      .from('sys_profiles')
      .select('role, department_id')
      .eq('id', callerUser.id)
      .single();

    // Self-healing: If profile doesn't exist, create it.
    if (!callerProfile) {
      console.warn(`Caller profile not found for user ${callerUser.id}. Attempting to create one.`);
      const { data: newProfile, error: createProfileError } = await supabaseAdmin
        .from('sys_profiles')
        .insert({
          id: callerUser.id,
          email: callerUser.email,
          full_name: callerUser.user_metadata?.full_name || callerUser.email,
          role: callerUser.user_metadata?.role || 'chuyên viên'
        })
        .select('role, department_id')
        .single();
      
      if (createProfileError) {
        console.error("Failed to self-heal and create caller profile:", createProfileError);
        throw new Error("Unauthorized: Could not verify or create caller profile.");
      }
      callerProfile = newProfile;
      console.log(`Successfully self-healed profile for user ${callerUser.id}.`);
    }

    if (!callerProfile) {
      return new Response(JSON.stringify({ error: "Unauthorized: Caller profile is missing and could not be created." }), { status: 403, headers: corsHeaders });
    }

    const callerRole = callerProfile.role;
    const callerDepartmentId = callerProfile.department_id;
    const { email, password, userData } = await req.json();

    if (!email || !password || !userData || !userData.role || !userData.full_name) {
      return new Response(JSON.stringify({ error: "Email, password, role, and full name are required." }), { status: 400, headers: corsHeaders });
    }

    if (!email.endsWith('@betacom.site')) {
      return new Response(JSON.stringify({ error: "Chỉ cho phép email có đuôi @betacom.site" }), { status: 400, headers: corsHeaders });
    }

    if (callerRole === 'leader') {
      if (!['chuyên viên', 'học việc/thử việc'].includes(userData.role)) {
        return new Response(JSON.stringify({ error: "Leader can only create 'chuyên viên' or 'học việc/thử việc' users." }), { status: 403, headers: corsHeaders });
      }
      if (userData.department_id !== callerDepartmentId) {
        return new Response(JSON.stringify({ error: "Leader can only create users within their assigned phòng ban." }), { status: 403, headers: corsHeaders });
      }
    } else if (callerRole !== 'admin') {
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions to create users." }), { status: 403, headers: corsHeaders });
    }

    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: userData,
    });

    if (createUserError) {
      throw createUserError;
    }

    return new Response(JSON.stringify({ user }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error in create-user function:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});