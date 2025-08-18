// @ts-nocheck
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
      throw new Error("Server configuration missing");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Authorization token required");

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) throw new Error("Unauthorized");

    const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role, team_id').eq('id', callerUser.id).single();
    if (!callerProfile) throw new Error("Caller profile not found");

    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");
    if (userId === callerUser.id) throw new Error("You cannot deactivate your own account.");

    const { data: targetProfile } = await supabaseAdmin.from('profiles').select('role, team_id').eq('id', userId).single();
    if (!targetProfile) throw new Error("Target user profile not found.");

    if (callerProfile.role === 'leader') {
      if (targetProfile.team_id !== callerProfile.team_id) throw new Error("Leader can only deactivate users within their team.");
      if (!['chuyên viên', 'học việc/thử việc'].includes(targetProfile.role)) throw new Error("Leader cannot deactivate users with this role.");
    } else if (callerProfile.role !== 'admin') {
      throw new Error("Forbidden: Insufficient permissions.");
    }

    console.log("Deactivating user:", userId);

    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !targetUser) throw new Error("Target user not found in auth.");

    const originalEmail = targetUser.email;
    const anonymizedEmail = `${originalEmail}.${Date.now()}.deleted`;

    // 1. Ban user from logging in and anonymize email in auth
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: anonymizedEmail,
        ban_duration: 'inf', // Ban indefinitely
      }
    );
    if (updateAuthError) throw updateAuthError;

    // 2. Update profile to 'deleted' and anonymize data
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'deleted',
        email: anonymizedEmail,
        full_name: 'Đã nghỉ việc',
        phone: null,
      })
      .eq('id', userId);
    if (updateProfileError) throw updateProfileError;

    console.log("User successfully deactivated:", userId);

    return new Response(JSON.stringify({ success: true, message: "User deactivated successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in deactivate-user function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});