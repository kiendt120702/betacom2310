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
    const { email, full_name, role, team } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
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

    console.log(`Attempting to manage profile for email: ${email}`);

    // 1. Get user from auth.users
    const { data: authUser, error: getAuthUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (getAuthUserError) {
      console.error('Error getting auth user by email:', getAuthUserError);
      return new Response(JSON.stringify({ error: `Failed to retrieve user from auth: ${getAuthUserError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!authUser?.user) {
      // This case should ideally not happen if called after "User already registered"
      // but good to handle defensively.
      return new Response(JSON.stringify({ error: 'User not found in authentication system.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authUser.user.id;

    // 2. Check if profile exists in public.profiles
    const { data: existingProfile, error: getProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (getProfileError && getProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching existing profile:', getProfileError);
      return new Response(JSON.stringify({ error: `Failed to check user profile: ${getProfileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingProfile) {
      // Profile exists, update it
      console.log(`Profile for user ${userId} already exists. Attempting to update.`);
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: full_name,
          role: role,
          team: team,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateProfileError) {
        console.error('Error updating existing profile:', updateProfileError);
        throw new Error(`Failed to update existing profile: ${updateProfileError.message}`);
      }
      console.log(`Profile for user ${userId} updated successfully.`);
      return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Profile does not exist, insert it
      console.log(`Profile for user ${userId} does not exist. Attempting to insert.`);
      const { error: insertProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: full_name,
          role: role,
          team: team,
        });

      if (insertProfileError) {
        console.error('Error inserting new profile:', insertProfileError);
        throw new Error(`Failed to create new profile: ${insertProfileError.message}`);
      }
      console.log(`Profile for user ${userId} created successfully.`);
      return new Response(JSON.stringify({ success: true, message: 'Profile created successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error('Unexpected error in manage-user-profile function:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});