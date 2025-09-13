import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Sử dụng environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing SUPABASE_PUBLISHABLE_KEY");
}

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