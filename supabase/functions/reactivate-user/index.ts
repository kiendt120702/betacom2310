// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Authorization token required");

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) throw new Error("Unauthorized");

    const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callerUser.id).single();
    if (!callerProfile || callerProfile.role !== 'admin') {
      throw new Error("Forbidden: Only admins can reactivate users.");
    }

    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");

    console.log("Reactivating user:", userId);

    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !targetUser) throw new Error("Target user not found in auth.");

    const anonymizedEmail = targetUser.email;
    if (!anonymizedEmail || !anonymizedEmail.endsWith('.deleted')) {
      throw new Error("User does not appear to be deactivated.");
    }

    const emailParts = anonymizedEmail.split('.');
    const originalEmail = emailParts.slice(0, -2).join('.');

    // 1. Unban user and restore email in auth
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: originalEmail,
        ban_duration: 'none',
      }
    );
    if (updateAuthError) throw updateAuthError;

    // 2. Update profile to a default active role
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'học việc/thử việc', // Default role upon reactivation
        email: originalEmail,
        full_name: 'Tài khoản được kích hoạt lại', // Placeholder name
      })
      .eq('id', userId);
    if (updateProfileError) throw updateProfileError;

    console.log("User successfully reactivated:", userId);

    return new Response(JSON.stringify({ success: true, message: "User reactivated successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in reactivate-user function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});