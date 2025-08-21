import { WorkType } from "@/types/supabase/enums"; // Import WorkType from enums.ts
import { UserRole } from "@/types/supabase/enums"; // Import UserRole from enums.ts

export type { UserRole, WorkType }; // Re-export them

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string; // Thêm trường số điện thoại
  role: UserRole;
  team_id: string | null;
  work_type?: WorkType; // Thêm trường hình thức làm việc
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
  join_date?: string | null;
  manager_id?: string | null;
}