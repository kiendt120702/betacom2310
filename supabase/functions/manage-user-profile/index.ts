/// <reference lib="deno.ns" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { userId, email, full_name, role, team_id, newPassword } = await req.json();

    if (!userId && !email) {
      return new Response(JSON.stringify({ error: 'User ID or email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
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

    // If userId is not provided but email is, try to get userId from email
    if (!targetUserId && email) {
      const { data: authUser, error: getAuthUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (getAuthUserError) {
        console.error('Error getting auth user by email:', getAuthUserError);
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
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Could not determine target user ID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Attempting to manage profile for user ID: ${targetUserId}`);

    // 1. Update user's password if newPassword is provided
    if (newPassword) {
      console.log(`Attempting to update password for user ${targetUserId}`);
      const { error: passwordUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { password: newPassword }
      );

      if (passwordUpdateError) {
        console.error('Error updating user password:', passwordUpdateError);
        return new Response(JSON.stringify({ error: `Failed to update password: ${passwordUpdateError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`Password for user ${targetUserId} updated successfully.`);
    }

    // 2. Update public.profiles data if other profile fields are provided
    if (full_name !== undefined || role !== undefined || team_id !== undefined) {
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

      const { data: existingProfile, error: getProfileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();

      if (getProfileError && getProfileError.code !== 'PGRST116') {
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
        const { error: insertProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: targetUserId,
            email: email,
            ...profileUpdateData,
          });

        if (insertProfileError) {
          console.error('Error inserting new profile:', insertProfileError);
          return new Response(JSON.stringify({ error: `Failed to create new profile: ${insertProfileError.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`Profile for user ${targetUserId} created successfully.`);
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