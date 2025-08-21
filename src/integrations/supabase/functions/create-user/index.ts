/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// More secure CORS configuration - replace with your actual domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // TODO: Replace with specific domain in production
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authenticated user making the request
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: "Authorization token required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token or user not found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch caller's profile to get their role and team_id
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, team_id')
      .eq('id', callerUser.id)
      .single();

    if (profileError || !callerProfile) {
      console.error("Error fetching caller profile:", profileError);
      return new Response(JSON.stringify({ error: "Unauthorized: Caller profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerRole = callerProfile.role;
    const callerTeamId = callerProfile.team_id;

    const { email, password, userData } = await req.json();

    console.log("Received user data in create-user function:", userData);

    if (!email || !password || !userData) {
      return new Response(JSON.stringify({ error: "Email, password, and user data are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email.endsWith('@betacom.site')) {
      return new Response(JSON.stringify({ error: "Chỉ cho phép email có đuôi @betacom.site" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Additional validation for user data
    if (!userData.role || !userData.full_name) {
      return new Response(JSON.stringify({ error: "Role and full name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Permission checks based on caller's role
    if (callerRole === 'leader') {
      // Leader can only create 'chuyên viên' or 'học việc/thử việc'
      if (!['chuyên viên', 'học việc/thử việc'].includes(userData.role)) {
        return new Response(JSON.stringify({ error: "Leader can only create 'chuyên viên' or 'học việc/thử việc' users." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Leader can only create users in their own team
      if (userData.team_id !== callerTeamId) {
        return new Response(JSON.stringify({ error: "Leader can only create users within their assigned phòng ban." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (callerRole !== 'admin') {
      // Only admin and leader can create users
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions to create users." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Automatically confirm the user's email
      user_metadata: userData,
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      return new Response(JSON.stringify({ error: createUserError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User created successfully:", user?.id);

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});