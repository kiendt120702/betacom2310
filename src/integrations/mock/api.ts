import { mockDatabase } from "./database";
import { mockAuth } from "./auth";
import {
  HydratedProfile,
  RoleName,
  ShopeeComprehensiveReport,
  ShopeeShop,
  ShopeeShopRevenue,
  ShopStatus,
  SysDepartment,
  SysRole,
  UserExerciseProgress,
  WorkType,
} from "./types";

export const mockApi = {
  auth: mockAuth,

  async getProfileById(id: string) {
    return mockDatabase.getProfileById(id);
  },

  async getRawProfile(id: string) {
    return mockDatabase.getRawProfile(id);
  },

  async listLeaderOptions() {
    return mockDatabase.listLeaderOptions();
  },

  async listUsers(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    selectedRole?: string;
    selectedTeam?: string;
    selectedManager?: string;
  }): Promise<{ users: HydratedProfile[]; totalCount: number }> {
    return mockDatabase.listUsers(params);
  },

  async createUser(params: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    role: RoleName;
    work_type?: WorkType;
    department_id?: string | null;
    manager_id?: string | null;
    join_date?: string | null;
  }) {
    return mockDatabase.createUser(params);
  },

  async updateUser(
    userId: string,
    updates: Partial<{
      full_name: string | null;
      email: string;
      phone: string | null;
      role: RoleName;
      department_id: string | null;
      work_type: WorkType;
      join_date: string | null;
      manager_id: string | null;
      password: string;
    }>,
  ) {
    return mockDatabase.updateUser(userId, updates);
  },

  async deleteUser(userId: string) {
    return mockDatabase.deleteUser(userId);
  },

  async bulkCreateUsers(
    users: Array<{
      email: string;
      password: string;
      full_name?: string;
      phone?: string;
      role: RoleName;
      work_type?: WorkType;
      department_id?: string | null;
      manager_id?: string | null;
      join_date?: string | null;
    }>,
  ) {
    return mockDatabase.bulkCreateUsers(users);
  },

  async listRoles(): Promise<SysRole[]> {
    return mockDatabase.listRoles();
  },

  async createRole(roleData: { name: RoleName | string; description?: string }) {
    return mockDatabase.createRole(roleData);
  },

  async updateRole(
    id: string,
    updates: Partial<Omit<SysRole, "id">>,
  ): Promise<SysRole | null> {
    return mockDatabase.updateRole(id, updates);
  },

  async deleteRole(id: string) {
    return mockDatabase.deleteRole(id);
  },

  async listDepartments(): Promise<SysDepartment[]> {
    return mockDatabase.listDepartments();
  },

  async createDepartment(name: string) {
    return mockDatabase.createDepartment(name);
  },

  async updateDepartment(id: string, name: string) {
    return mockDatabase.updateDepartment(id, name);
  },

  async deleteDepartment(id: string) {
    return mockDatabase.deleteDepartment(id);
  },

  async listShops(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    status?: ShopStatus | "all";
  }): Promise<{ shops: Array<ShopeeShop & { profile: HydratedProfile | null }>; totalCount: number }> {
    return mockDatabase.listShops(params);
  },

  async createShop(data: {
    name: string;
    profile_id?: string | null;
    status?: ShopStatus;
    department_id?: string | null;
  }): Promise<ShopeeShop> {
    return mockDatabase.createShop(data);
  },

  async updateShop(
    id: string,
    updates: Partial<Omit<ShopeeShop, "id" | "created_at">>,
  ): Promise<ShopeeShop | null> {
    return mockDatabase.updateShop(id, updates);
  },

  async deleteShop(id: string) {
    return mockDatabase.deleteShop(id);
  },

  async getReportsForMonth(month: string): Promise<ShopeeComprehensiveReport[]> {
    return mockDatabase.getReportsForMonth(month);
  },

  async listAllComprehensiveReports(): Promise<ShopeeComprehensiveReport[]> {
    return mockDatabase.listComprehensiveReports();
  },

  async listReportsWithShopDetails(month: string) {
    return mockDatabase.listReportsWithShopDetails(month);
  },

  async upsertComprehensiveReport(params: {
    shopId: string;
    month: string;
    feasible_goal?: number | null;
    breakthrough_goal?: number | null;
  }) {
    return mockDatabase.upsertComprehensiveReport(params);
  },

  async getMonthlyPerformance(months: number) {
    return mockDatabase.getMonthlyPerformance(months);
  },

  async listShopRevenue(filters: { shopId?: string; month?: string }) {
    return mockDatabase.listShopRevenue(filters);
  },

  async getUserExerciseProgress(userId: string, exerciseId?: string) {
    return mockDatabase.getUserExerciseProgress(userId, exerciseId);
  },

  async upsertExerciseProgress(
    userId: string,
    exerciseId: string,
    updates: Partial<UserExerciseProgress>,
  ) {
    return mockDatabase.upsertExerciseProgress(userId, exerciseId, updates);
  },
};

export type {
  HydratedProfile,
  RoleName,
  ShopeeComprehensiveReport,
  ShopeeShop,
  ShopeeShopRevenue,
  ShopStatus,
  SysDepartment,
  SysRole,
  UserExerciseProgress,
  WorkType,
};
