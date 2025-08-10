
import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type WorkType = Database["public"]["Enums"]["work_type"];

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  team_id: string | null;
  work_type?: WorkType;
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  team_id?: string | null;
  work_type?: WorkType;
  password?: string;
  oldPassword?: string;
}
