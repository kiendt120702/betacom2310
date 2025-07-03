export type UserRole = Database['public']['Enums']['user_role'];

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  // Removed team: TeamType | null;
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: UserRole;
  // Removed team?: TeamType | null;
}