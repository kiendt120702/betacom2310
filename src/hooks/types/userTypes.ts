export type TeamType = Database['public']['Enums']['team_type'];
export type UserRole = Database['public']['Enums']['user_role'];

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  team: TeamType | null; // Changed to allow null
}

export interface UpdateUserData {
  id: string;
  full_name?: string;
  role?: UserRole;
  team?: TeamType | null;
}