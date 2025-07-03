import { Database } from '@/integrations/supabase/types';

export type TeamType = Database['public']['Enums']['team_type'];
export type UserRole = Database['public']['Enums']['user_role'];

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole; // Still use name for initial creation metadata
  team: TeamType; // Still use name for initial creation metadata
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  role_id?: string; // Now expects UUID
  team_id?: string | null; // Now expects UUID
}