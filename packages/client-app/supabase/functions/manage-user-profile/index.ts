import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      userId,
      email,
      full_name,
      role,
      team_id,
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration for service role client");
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let targetUserId = userId;
    let currentEmailInAuth = email;

    if (
      !targetUserId ||
      (targetUserId && !currentEmailInAuth && newPassword && oldPassword)
    ) {
      const { data: authUser, error: getAuthUserError } = targetUserId
        ? await supabaseAdmin.auth.admin.getUserById(targetUserId)
        : await supabaseAdmin.auth.admin.getUserByEmail(email);

      if (getAuthUserError) {
        console.error("Error getting auth user:", getAuthUserError);
        return new Response(
          JSON.stringify({
            error: `Failed to retrieve user from auth: ${getAuthUserError.message}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (!authUser?.user) {
        return new Response(
          JSON.stringify({ error: "User not found in authentication system." }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
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

    console.log(`Attempting to manage profile for user ID: ${targetUserId}`);

    if (newPassword && oldPassword) {
      console.log(`Attempting to verify old password for user ${targetUserId}`);

      if (!currentEmailInAuth) {
        return new Response(
          JSON.stringify({
            error: "User email not found for old password verification.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { error: signInError } =
        await supabaseAdmin.auth.signInWithPassword({
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

    if (
      full_name !== undefined ||
      role !== undefined ||
      team_id !== undefined
    ) {
      console.log(`Attempting to update profile data for user ${targetUserId}`);
      const profileUpdateData: {
        full_name?: string;
        role?: string;
        team_id?: string | null;
        updated_at: string;
        email?: string;
      } = { updated_at: new Date().toISOString() };

      if (full_name !== undefined) profileUpdateData.full_name = full_name;
      if (role !== undefined) profileUpdateData.role = role;
      if (team_id !== undefined) profileUpdateData.team_id = team_id;
      if (email !== undefined) profileUpdateData.email = email;

      const { data: existingProfile, error: getProfileError } =
        await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", targetUserId)
          .single();

      if (getProfileError && getProfileError.code !== "PGRST116") {
        console.error("Error fetching existing profile:", getProfileError);
        return new Response(
          JSON.stringify({
            error: `Failed to check user profile: ${getProfileError.message}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (existingProfile) {
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
      } else {
        console.warn(
          `Profile for user ${targetUserId} not found, attempting to insert.`,
        );
        const { error: insertProfileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: targetUserId,
            email: email || currentEmailInAuth,
            ...profileUpdateData,
          });

        if (insertProfileError) {
          console.error("Error inserting new profile:", insertProfileError);
          if (!insertProfileError.message.includes("duplicate key value")) {
            return new Response(
              JSON.stringify({
                error: `Failed to create new profile: ${insertProfileError.message}`,
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
          }
        }
        console.log(
          `Profile for user ${targetUserId} created/updated successfully (fallback).`,
        );
      }
    }

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
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});