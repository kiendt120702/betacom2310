// @ts-ignore
/// <reference lib="deno.ns" />
// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email, full_name, role, team_id, newPassword, oldPassword } = await req.json(); // Add oldPassword

    if (!userId && !email) {
      return new Response(JSON.stringify({ error: 'User ID or email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration for service role client');
      return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let targetUserId = userId;
    let currentEmailInAuth = email; // Use provided email as a hint, or fetch if not provided

    // If userId is not provided but email is, try to get userId from email
    // OR if userId is provided but email is not, fetch current email for password verification
    if (!targetUserId || (targetUserId && !currentEmailInAuth && (newPassword && oldPassword))) {
      const { data: authUser, error: getAuthUserError } = targetUserId
        ? await supabaseAdmin.auth.admin.getUserById(targetUserId)
        : await supabaseAdmin.auth.admin.getUserByEmail(email);

      if (getAuthUserError) {
        console.error('Error getting auth user:', getAuthUserError);
        return new Response(JSON.stringify({ error: `Failed to retrieve user from auth: ${getAuthUserError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!authUser?.user) {
        return new Response(JSON.stringify({ error: 'User not found in authentication system.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      targetUserId = authUser.user.id;
      currentEmailInAuth = authUser.user.email; // Ensure we have the current email for verification
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Could not determine target user ID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Attempting to manage profile for user ID: ${targetUserId}`);

    // --- LOGIC FOR OLD PASSWORD VERIFICATION ---
    if (newPassword && oldPassword) {
      console.log(`Attempting to verify old password for user ${targetUserId}`);
      
      if (!currentEmailInAuth) {
        // This should ideally not happen if the above logic is correct, but as a safeguard
        return new Response(JSON.stringify({ error: 'User email not found for old password verification.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Attempt to sign in with old password to verify
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: currentEmailInAuth, // Use the fetched/provided email
        password: oldPassword,
      });

      if (signInError) {
        console.error('Old password verification failed:', signInError);
        return new Response(JSON.stringify({ error: 'Mật khẩu cũ không đúng.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`Old password verified for user ${targetUserId}.`);
    }
    // --- END OLD PASSWORD LOGIC ---

    // 1. Update user's auth data (email, password)
    const authUpdateData: { email?: string; password?: string; } = {};
    if (email !== undefined) authUpdateData.email = email;
    if (newPassword !== undefined) authUpdateData.password = newPassword;

    if (Object.keys(authUpdateData).length > 0) {
      console.log(`Attempting to update auth data for user ${targetUserId}:`, authUpdateData);
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        authUpdateData
      );

      if (authUpdateError) {
        console.error('Error updating user auth data:', authUpdateError);
        return new Response(JSON.stringify({ error: `Failed to update authentication details: ${authUpdateError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`Auth data for user ${targetUserId} updated successfully.`);
    }

    // 2. Update public.profiles data
    if (full_name !== undefined || role !== undefined || team_id !== undefined) {
      console.log(`Attempting to update profile data for user ${targetUserId}`);
      const profileUpdateData: {
        full_name?: string;
        role?: string;
        team_id?: string | null;
        updated_at: string;
        email?: string; // Include email here for profiles table
      } = { updated_at: new Date().toISOString() };

      if (full_name !== undefined) profileUpdateData.full_name = full_name;
      if (role !== undefined) profileUpdateData.role = role;
      if (team_id !== undefined) profileUpdateData.team_id = team_id;
      if (email !== undefined) profileUpdateData.email = email; // Update email in profiles table

      const { data: existingProfile, error: getProfileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();

      if (getProfileError && getProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching existing profile:', getProfileError);
        return new Response(JSON.stringify({ error: `Failed to check user profile: ${getProfileError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (existingProfile) {
        const { error: updateProfileError } = await supabaseAdmin
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', targetUserId);

        if (updateProfileError) {
          console.error('Error updating existing profile:', updateProfileError);
          return new Response(JSON.stringify({ error: `Failed to update existing profile: ${updateProfileError.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`Profile for user ${targetUserId} updated successfully.`);
      } else {
        // This case should ideally be handled by the handle_new_user trigger,
        // but as a fallback, insert if profile doesn't exist.
        // Note: This insert might fail if the trigger already created it.
        console.warn(`Profile for user ${targetUserId} not found, attempting to insert.`);
        const { error: insertProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: targetUserId,
            email: email || currentEmailInAuth, // Use provided email or the one from auth
            ...profileUpdateData,
          });

        if (insertProfileError) {
          console.error('Error inserting new profile:', insertProfileError);
          // If it's a duplicate key error, it means the trigger already handled it, so it's fine.
          if (!insertProfileError.message.includes('duplicate key value')) {
            return new Response(JSON.stringify({ error: `Failed to create new profile: ${insertProfileError.message}` }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        console.log(`Profile for user ${targetUserId} created/updated successfully (fallback).`);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'User and/or profile updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unexpected error in manage-user-profile function:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});