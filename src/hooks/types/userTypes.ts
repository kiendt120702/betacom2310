import { WorkType, RoleName as UserRole } from "@/integrations/mock";

export type { UserRole, WorkType };

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string; // Thêm trường số điện thoại
  role: UserRole;
  department_id: string | null;
  work_type?: WorkType; // Thêm trường hình thức làm việc
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  department_id?: string | null;
  work_type?: WorkType;
  password?: string;
  oldPassword?: string;
  join_date?: string | null;
  manager_id?: string | null;
}
