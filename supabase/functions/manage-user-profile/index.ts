// @ts-nocheck
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

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
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
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

    const {
      userId,
      email,
      full_name,
      phone, // Added phone
      work_type, // Added work_type
      join_date, // Added join_date
      manager_id, // Added manager_id
      role, // New role to be set
      team_id, // New team_id to be set
      newPassword,
      oldPassword,
    } = await req.json();

    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: "User ID or email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let targetUserId = userId;
    let currentEmailInAuth = email;

    // If targetUserId is not provided, try to get it from email
    if (!targetUserId && email) {
      const { data: authUser, error: getAuthUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (getAuthUserError || !authUser?.user) {
        console.error("Error getting auth user by email:", getAuthUserError);
        return new Response(
          JSON.stringify({ error: `Failed to retrieve user by email: ${getAuthUserError?.message || "User not found"}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetUserId = authUser.user.id;
      currentEmailInAuth = authUser.user.email;
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Could not determine target user ID." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch target user's current profile to check permissions
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role, team_id')
      .eq('id', targetUserId)
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

    // Self-edit is always allowed for basic fields (full_name, phone, email, password)
    const isSelfEdit = callerUser.id === targetUserId;

    // Permission checks for non-self edits
    if (!isSelfEdit) {
      if (callerRole === 'admin') {
        // Admin has full permissions to edit anyone including leaders
        if (role !== undefined) profileUpdateData.role = role;
        if (team_id !== undefined) profileUpdateData.team_id = team_id;
      } else if (callerRole === 'leader') {
        // Leader can only edit users in their own team
        if (targetUserTeamId !== callerTeamId) {
          return new Response(JSON.stringify({ error: "Leader can only edit users within their assigned phòng ban." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Leader can only edit 'chuyên viên' or 'học việc/thử việc' roles
        if (!['chuyên viên', 'học việc/thử việc'].includes(targetUserRole)) {
          return new Response(JSON.stringify({ error: "Leader cannot edit users with this role." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Leader cannot change role to 'admin' or 'leader'
        if (role && ['admin', 'leader'].includes(role)) {
          return new Response(JSON.stringify({ error: "Leader cannot assign 'admin' or 'leader' roles." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Leader cannot change team_id to a different team
        if (team_id && team_id !== callerTeamId) {
          return new Response(JSON.stringify({ error: "Leader cannot assign users to other phòng ban." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        // Only admin and leader can edit other users
        return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions to edit users." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`Attempting to manage profile for user ID: ${targetUserId}`);

    // Handle password change (requires old password verification if not admin)
    if (newPassword && oldPassword) {
      if (!isSelfEdit && callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: "Only admin can change other users' passwords without old password verification." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (isSelfEdit) { // Only verify old password if it's a self-edit
        console.log(`Attempting to verify old password for user ${targetUserId}`);
        if (!currentEmailInAuth) {
          const { data: authUser, error: getAuthUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
          if (getAuthUserError || !authUser?.user) {
            return new Response(
              JSON.stringify({ error: `Failed to retrieve user email for verification: ${getAuthUserError?.message || "User not found"}` }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          currentEmailInAuth = authUser.user.email;
        }

        // Create a temporary client with the ANON KEY to verify the password
        // @ts-ignore
        const tempClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!); // Use ANON KEY
        const { error: signInError } = await tempClient.auth.signInWithPassword({
          email: currentEmailInAuth,
          password: oldPassword,
        });

        if (signInError) {
          console.error("Old password verification failed:", signInError);
          return new Response(
            JSON.stringify({ error: "Mật khẩu cũ không đúng." }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        console.log(`Old password verified for user ${targetUserId}.`);
      }
    }

    const authUpdateData: { email?: string; password?: string } = {};
    if (email !== undefined) authUpdateData.email = email;
    if (newPassword !== undefined) authUpdateData.password = newPassword;

    if (Object.keys(authUpdateData).length > 0) {
      console.log(
        `Attempting to update auth data for user ${targetUserId}:`,
        authUpdateData,
      );
      const { error: authUpdateError } =
        await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          authUpdateData,
        );

      if (authUpdateError) {
        console.error("Error updating user auth data:", authUpdateError);
        return new Response(
          JSON.stringify({
            error: `Failed to update authentication details: ${authUpdateError.message}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      console.log(`Auth data for user ${targetUserId} updated successfully.`);
    }

    // Update profile data
    const profileUpdateData: {
      full_name?: string;
      email?: string;
      phone?: string;
      work_type?: string;
      join_date?: string | null;
      manager_id?: string | null;
      role?: string;
      team_id?: string | null;
      updated_at: string;
    } = { updated_at: new Date().toISOString() };

    if (full_name !== undefined) profileUpdateData.full_name = full_name;
    if (email !== undefined) profileUpdateData.email = email;
    if (phone !== undefined) profileUpdateData.phone = phone;
    if (work_type !== undefined) profileUpdateData.work_type = work_type;
    if (join_date !== undefined) profileUpdateData.join_date = join_date;
    if (manager_id !== undefined) profileUpdateData.manager_id = manager_id; // Added manager_id

    // Admin can change anything, leaders can change their team members' info
    if (callerRole === 'admin') {
      // Admin has full permissions to edit anyone including leaders
      if (role !== undefined) profileUpdateData.role = role;
      if (team_id !== undefined) profileUpdateData.team_id = team_id;
    } else if (callerRole === 'leader' && targetUserTeamId === callerTeamId && ['chuyên viên', 'học việc/thử việc'].includes(targetUserRole)) {
      // Leaders can only edit their team members with specific roles
      if (role !== undefined) profileUpdateData.role = role;
      if (team_id !== undefined) profileUpdateData.team_id = team_id;
    } else if (isSelfEdit) {
      // Allow self-edit of full_name, email, phone, work_type, join_date
      // Role, team_id, and manager_id are not editable by self
    } else {
      // Prevent unauthorized role/team_id/manager_id changes
      if (role !== undefined && role !== targetUserRole) {
        console.warn(`Attempted unauthorized role change for user ${targetUserId} by ${callerUser.id}.`);
      }
      if (team_id !== undefined && team_id !== targetUserTeamId) {
        console.warn(`Attempted unauthorized team_id change for user ${targetUserId} by ${callerUser.id}.`);
      }
      if (manager_id !== undefined && manager_id !== targetProfile.manager_id) { // Compare with existing manager_id
        console.warn(`Attempted unauthorized manager_id change for user ${targetUserId} by ${callerUser.id}.`);
      }
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", targetUserId);

    if (updateProfileError) {
      console.error("Error updating existing profile:", updateProfileError);
      return new Response(
        JSON.stringify({
          error: `Failed to update existing profile: ${updateProfileError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    console.log(`Profile for user ${targetUserId} updated successfully.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User and/or profile updated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error in manage-user-profile function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});