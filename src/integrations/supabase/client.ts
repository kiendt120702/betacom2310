import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Import client Supabase như sau:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  "https://tjzeskxkqvjbowikzqpv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqemVza3hrcXZqYm93aWt6cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjg0MjcsImV4cCI6MjA2NTkwNDQyN30.T-AV2KidsjI9c1Y7ue4Rk8PxSbG_ZImh7J0uCAz3qGk",
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