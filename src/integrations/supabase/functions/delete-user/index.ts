// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

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
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
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

    const { data: callerProfile } = await supabaseAdmin.from('sys_profiles').select('role, team_id').eq('id', callerUser.id).single();
    if (!callerProfile) throw new Error("Caller profile not found");

    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");
    if (userId === callerUser.id) throw new Error("You cannot delete your own account.");

    const { data: targetProfile } = await supabaseAdmin.from('sys_profiles').select('role, team_id').eq('id', userId).single();
    if (!targetProfile) throw new Error("Target user profile not found.");

    if (callerProfile.role === 'leader') {
      if (targetProfile.team_id !== callerProfile.team_id) throw new Error("Leader can only delete users within their phòng ban.");
      if (!['chuyên viên', 'học việc/thử việc'].includes(targetProfile.role)) throw new Error("Leader cannot delete users with this role.");
    } else if (callerProfile.role !== 'admin') {
      throw new Error("Forbidden: Insufficient permissions.");
    }

    console.log("Deleting user:", userId);

    // Hard delete the user from auth.users.
    // The profile in public.sys_profiles will be deleted automatically due to ON DELETE CASCADE.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    console.log("User successfully deleted:", userId);

    return new Response(JSON.stringify({ success: true, message: "User deleted successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in delete-user function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});