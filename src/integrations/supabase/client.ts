import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

// Sử dụng biến môi trường cho thông tin Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("Thiếu biến môi trường bắt buộc: VITE_SUPABASE_URL");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Thiếu biến môi trường bắt buộc: VITE_SUPABASE_ANON_KEY");
}

// Export để sử dụng trong các hàm Edge Functions
export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };

// Import client Supabase như sau:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    global: {
      headers: {
        'x-client-info': 'slide-show-nexus-admin',
      },
    },
  }
);