import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Hardcoded Supabase configuration for environments where VITE_* env vars aren't available
export const SUPABASE_URL = "https://tjzeskxkqvjbowikzqpv.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemVza3hrcXZqYm93aWt6cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjg0MjcsImV4cCI6MjA2NTkwNDQyN30.T-AV2KidsjI9c1Y7ue4Rk8PxSbG_ZImh7J0uCAz3qGk";

// Import client Supabase như sau:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Tăng thời gian retry khi có vấn đề mạng
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Giữ session lâu hơn trong localStorage
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    // Cấu hình retry cho các vấn đề mạng
    global: {
      headers: {
        'x-client-info': 'slide-show-nexus-admin',
      },
    },
  }
);