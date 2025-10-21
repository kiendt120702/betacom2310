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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error("Authorization token required");

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) throw new Error("Unauthorized");

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
      throw new Error("Unauthorized: Caller profile is missing and could not be created.");
    }

    const callerRole = callerProfile.role;
    const callerDepartmentId = callerProfile.department_id;
    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");
    if (userId === callerUser.id) throw new Error("You cannot delete your own account.");

    const { data: targetProfile } = await supabaseAdmin.from('sys_profiles').select('role, department_id').eq('id', userId).single();
    if (!targetProfile) throw new Error("Target user profile not found.");

    if (callerRole === 'leader') {
      if (targetProfile.department_id !== callerDepartmentId) throw new Error("Leader can only delete users within their phòng ban.");
      if (!['chuyên viên', 'học việc/thử việc'].includes(targetProfile.role)) throw new Error("Leader cannot delete users with this role.");
    } else if (callerRole !== 'admin') {
      throw new Error("Forbidden: Insufficient permissions.");
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

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