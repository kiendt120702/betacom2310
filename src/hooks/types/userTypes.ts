import { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  team_id: string;
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: UserRole;
  team_id?: string | null;
  password?: string; // Added password field
  oldPassword?: string; // Added oldPassword field for self-update verification
}