// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

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
        console.error("Failed to self-heal and create caller profile:", JSON.stringify(createProfileError, null, 2));
        throw new Error(`Unauthorized: Could not create caller profile. Reason: ${createProfileError.message}`);
      }
      callerProfile = newProfile;
      console.log(`Successfully self-healed profile for user ${callerUser.id}.`);
    }

    if (!callerProfile) {
      throw new Error("Unauthorized: Caller profile not found and could not be created.");
    }

    const callerRole = callerProfile.role;
    const callerDepartmentId = callerProfile.department_id;
    const { userId, email, full_name, phone, work_type, join_date, manager_id, role, department_id, newPassword, oldPassword } = await req.json();
    
    let targetUserId = userId;
    if (!targetUserId && email) {
      const { data: authUser, error: getAuthUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (getAuthUserError || !authUser?.user) {
        return new Response(JSON.stringify({ error: `User not found by email: ${getAuthUserError?.message}` }), { status: 404, headers: corsHeaders });
      }
      targetUserId = authUser.user.id;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Could not determine target user ID." }), { status: 400, headers: corsHeaders });
    }

    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('sys_profiles')
      .select('role, department_id, manager_id')
      .eq('id', targetUserId)
      .single();

    if (targetProfileError || !targetProfile) {
      return new Response(JSON.stringify({ error: "Target user profile not found." }), { status: 404, headers: corsHeaders });
    }

    const isSelfEdit = callerUser.id === targetUserId;

    if (!isSelfEdit) {
      if (callerRole === 'leader') {
        if (targetProfile.department_id !== callerDepartmentId || !['chuyên viên', 'học việc/thử việc'].includes(targetProfile.role)) {
          return new Response(JSON.stringify({ error: "Leader can only edit their team members." }), { status: 403, headers: corsHeaders });
        }
        if ((role && !['chuyên viên', 'học việc/thử việc'].includes(role)) || (department_id && department_id !== callerDepartmentId)) {
          return new Response(JSON.stringify({ error: "Leader has limited editing permissions." }), { status: 403, headers: corsHeaders });
        }
      } else if (callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions." }), { status: 403, headers: corsHeaders });
      }
    }
    
    // Handle password change
    if (newPassword && oldPassword) {
      if (!isSelfEdit && callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: "Only admin can change other users' passwords without old password verification." }), { status: 403, headers: corsHeaders });
      }
      if (isSelfEdit) {
        const tempClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
        const { error: signInError } = await tempClient.auth.signInWithPassword({ email: callerUser.email, password: oldPassword });
        if (signInError) {
          return new Response(JSON.stringify({ error: "Mật khẩu cũ không đúng." }), { status: 401, headers: corsHeaders });
        }
      }
    }

    // Update auth data
    const authUpdateData = {};
    if (email !== undefined) authUpdateData.email = email;
    if (newPassword !== undefined) authUpdateData.password = newPassword;
    if (Object.keys(authUpdateData).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, authUpdateData);
      if (authUpdateError) throw new Error(`Failed to update auth details: ${authUpdateError.message}`);
    }

    // Update profile data
    const profileUpdateData = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) profileUpdateData.full_name = full_name;
    if (email !== undefined) profileUpdateData.email = email;
    if (phone !== undefined) profileUpdateData.phone = phone;
    if (work_type !== undefined) profileUpdateData.work_type = work_type;
    if (join_date !== undefined) profileUpdateData.join_date = join_date;
    if (manager_id !== undefined) profileUpdateData.manager_id = manager_id;
    if (role !== undefined) profileUpdateData.role = role;
    if (department_id !== undefined) profileUpdateData.department_id = department_id;

    // Permission checks for profile fields
    if (!isSelfEdit) {
      if (callerRole !== 'admin' && callerRole !== 'leader') {
        // If not admin or leader, no profile fields can be changed for others
        Object.keys(profileUpdateData).forEach(key => {
          if (key !== 'updated_at') delete profileUpdateData[key];
        });
      } else if (callerRole === 'leader') {
        // Leader cannot change role to admin/leader, or change department
        if (profileUpdateData.role && ['admin', 'leader'].includes(profileUpdateData.role)) delete profileUpdateData.role;
        if (profileUpdateData.department_id && profileUpdateData.department_id !== callerDepartmentId) delete profileUpdateData.department_id;
      }
    } else {
      // Self-edit restrictions
      if (profileUpdateData.role) delete profileUpdateData.role;
      if (profileUpdateData.department_id) delete profileUpdateData.department_id;
      if (profileUpdateData.manager_id) delete profileUpdateData.manager_id;
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("sys_profiles")
      .update(profileUpdateData)
      .eq("id", targetUserId);

    if (updateProfileError) throw new Error(`Failed to update profile: ${updateProfileError.message}`);

    return new Response(JSON.stringify({ success: true, message: "User profile updated successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in manage-user-profile function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});