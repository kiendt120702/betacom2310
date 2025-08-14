/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing configuration");
      return new Response(JSON.stringify({ error: "Configuration missing" }), {
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
    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role, team_id')
      .eq('id', callerUser.id)
      .single();

    if (callerProfileError || !callerProfile) {
      console.error("Error fetching caller profile:", callerProfileError);
      return new Response(JSON.stringify({ error: "Unauthorized: Caller profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerRole = callerProfile.role;
    const callerTeamId = callerProfile.team_id;

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Attempting to delete user:", userId);

    // Prevent self-deletion
    if (userId === callerUser.id) {
      return new Response(JSON.stringify({ error: "You cannot delete your own account." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch target user's profile to check permissions
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role, team_id')
      .eq('id', userId)
      .single();

    if (targetProfileError || !targetProfile) {
      console.error("Error fetching target profile:", targetProfileError);
      return new Response(JSON.stringify({ error: "Target user profile not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserRole = targetProfile.role;
    const targetUserTeamId = targetProfile.team_id;

    // Permission checks based on caller's role
    if (callerRole === 'leader') {
      // Leader can only delete users in their own team
      if (targetUserTeamId !== callerTeamId) {
        return new Response(JSON.stringify({ error: "Leader can only delete users within their assigned team." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Leader can only delete 'chuyên viên' or 'học việc/thử việc' roles
      if (!['chuyên viên', 'học việc/thử việc'].includes(targetUserRole)) {
        return new Response(JSON.stringify({ error: "Leader cannot delete users with this role." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (callerRole !== 'admin') {
      // Only admin and leader can delete users
      return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions to delete users." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the user from auth.users
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting user from auth:", deleteAuthError);
      return new Response(JSON.stringify({ error: deleteAuthError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User successfully deleted from auth:", userId);

    return new Response(JSON.stringify({ success: true }), {
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