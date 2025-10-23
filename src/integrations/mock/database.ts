import {
  AuthUser,
  BannerImage,
  HydratedProfile,
  MockUser,
  RoleName,
  ShopeeComprehensiveReport,
  ShopeeShop,
  ShopeeShopRevenue,
  ShopStatus,
  StorageFile,
  SysDepartment,
  SysProfile,
  SysRole,
  UserExerciseProgress,
  WorkType,
} from "./types";

type Nullable<T> = T | null;

const baseDate = new Date("2024-01-01T08:00:00.000Z").toISOString();

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mock_${Math.random().toString(36).slice(2, 11)}${Date.now()}`;
};

const cloneDeep = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const departments: SysDepartment[] = [
  {
    id: "dept-ops",
    name: "Vận hành",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "dept-sales",
    name: "Kinh doanh",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "dept-marketing",
    name: "Marketing",
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const roles: SysRole[] = [
  {
    id: "role-admin",
    name: "admin",
    description: "Super Admin",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "role-leader",
    name: "leader",
    description: "Team Leader",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "role-head",
    name: "trưởng phòng",
    description: "Trưởng phòng",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "role-staff",
    name: "chuyên viên",
    description: "Chuyên viên",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "role-trainee",
    name: "học việc/thử việc",
    description: "Học việc/Thử việc",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "role-deleted",
    name: "deleted",
    description: "Đã xóa",
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const profiles: SysProfile[] = [
  {
    id: "user-admin",
    email: "admin@betacom.vn",
    full_name: "Nguyễn Hồng Quân",
    phone: "0900000000",
    role: "admin",
    work_type: "fulltime",
    department_id: "dept-ops",
    manager_id: null,
    join_date: "2022-05-01",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "user-head-sales",
    email: "truongphong.sales@betacom.vn",
    full_name: "Trần Mai Anh",
    phone: "0901111111",
    role: "trưởng phòng",
    work_type: "fulltime",
    department_id: "dept-sales",
    manager_id: "user-admin",
    join_date: "2022-06-10",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "user-leader-sales",
    email: "leader.sales@betacom.vn",
    full_name: "Lê Văn Hùng",
    phone: "0902222222",
    role: "leader",
    work_type: "fulltime",
    department_id: "dept-sales",
    manager_id: "user-head-sales",
    join_date: "2022-07-15",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "user-staff-hoa",
    email: "hoa.nguyen@betacom.vn",
    full_name: "Nguyễn Thu Hoa",
    phone: "0903333333",
    role: "chuyên viên",
    work_type: "fulltime",
    department_id: "dept-sales",
    manager_id: "user-leader-sales",
    join_date: "2023-01-05",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "user-staff-minh",
    email: "minh.pham@betacom.vn",
    full_name: "Phạm Gia Minh",
    phone: "0904444444",
    role: "chuyên viên",
    work_type: "parttime",
    department_id: "dept-marketing",
    manager_id: "user-leader-sales",
    join_date: "2023-03-12",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "user-trainee",
    email: "trainee@betacom.vn",
    full_name: "Đặng Phương Thảo",
    phone: "0905555555",
    role: "học việc/thử việc",
    work_type: "fulltime",
    department_id: "dept-marketing",
    manager_id: "user-leader-sales",
    join_date: "2024-02-01",
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const authUsers: AuthUser[] = [
  {
    id: "auth-admin",
    email: "admin@betacom.vn",
    password: "admin123",
    profile_id: "user-admin",
  },
  {
    id: "auth-head-sales",
    email: "truongphong.sales@betacom.vn",
    password: "password123",
    profile_id: "user-head-sales",
  },
  {
    id: "auth-leader-sales",
    email: "leader.sales@betacom.vn",
    password: "password123",
    profile_id: "user-leader-sales",
  },
  {
    id: "auth-hoa",
    email: "hoa.nguyen@betacom.vn",
    password: "password123",
    profile_id: "user-staff-hoa",
  },
  {
    id: "auth-minh",
    email: "minh.pham@betacom.vn",
    password: "password123",
    profile_id: "user-staff-minh",
  },
  {
    id: "auth-trainee",
    email: "trainee@betacom.vn",
    password: "password123",
    profile_id: "user-trainee",
  },
];

const shops: ShopeeShop[] = [
  {
    id: "shop-kinhdoanh",
    name: "Betacom Kinh Doanh",
    profile_id: "user-staff-hoa",
    status: "Đang Vận Hành",
    department_id: "dept-sales",
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "shop-chamsoc",
    name: "Betacom Chăm Sóc",
    profile_id: "user-staff-minh",
    status: "Shop mới",
    department_id: "dept-marketing",
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const reportDate = (day: number) =>
  new Date(Date.UTC(2024, 6, day)).toISOString().split("T")[0];

const comprehensiveReports: ShopeeComprehensiveReport[] = [
  {
    id: "report-kinhdoanh-01",
    shop_id: "shop-kinhdoanh",
    report_date: reportDate(1),
    total_revenue: 12000000,
    total_orders: 150,
    total_visits: 3200,
    product_clicks: 4500,
    average_order_value: 80000,
    conversion_rate: 4.7,
    buyer_return_rate: 12.5,
    cancelled_orders: 5,
    cancelled_revenue: 400000,
    existing_buyers: 80,
    new_buyers: 40,
    potential_buyers: 30,
    returned_orders: 3,
    returned_revenue: 210000,
    total_buyers: 120,
    feasible_goal: 15000000,
    breakthrough_goal: 18000000,
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "report-kinhdoanh-02",
    shop_id: "shop-kinhdoanh",
    report_date: reportDate(2),
    total_revenue: 14500000,
    total_orders: 170,
    total_visits: 3500,
    product_clicks: 5000,
    average_order_value: 85294,
    conversion_rate: 4.85,
    buyer_return_rate: 13.2,
    cancelled_orders: 6,
    cancelled_revenue: 480000,
    existing_buyers: 90,
    new_buyers: 50,
    potential_buyers: 35,
    returned_orders: 4,
    returned_revenue: 260000,
    total_buyers: 140,
    feasible_goal: 15000000,
    breakthrough_goal: 18000000,
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "report-chamsoc-01",
    shop_id: "shop-chamsoc",
    report_date: reportDate(1),
    total_revenue: 5000000,
    total_orders: 80,
    total_visits: 2100,
    product_clicks: 2300,
    average_order_value: 62500,
    conversion_rate: 3.8,
    buyer_return_rate: 9.5,
    cancelled_orders: 2,
    cancelled_revenue: 130000,
    existing_buyers: 35,
    new_buyers: 25,
    potential_buyers: 20,
    returned_orders: 1,
    returned_revenue: 50000,
    total_buyers: 60,
    feasible_goal: 7000000,
    breakthrough_goal: 9000000,
    created_at: baseDate,
    updated_at: baseDate,
  },
  {
    id: "report-chamsoc-02",
    shop_id: "shop-chamsoc",
    report_date: reportDate(2),
    total_revenue: 6200000,
    total_orders: 92,
    total_visits: 2300,
    product_clicks: 2500,
    average_order_value: 67391,
    conversion_rate: 4,
    buyer_return_rate: 10.1,
    cancelled_orders: 2,
    cancelled_revenue: 150000,
    existing_buyers: 40,
    new_buyers: 30,
    potential_buyers: 18,
    returned_orders: 1,
    returned_revenue: 60000,
    total_buyers: 70,
    feasible_goal: 7000000,
    breakthrough_goal: 9000000,
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const shopRevenues: ShopeeShopRevenue[] = [
  {
    id: "revenue-kinhdoanh-2024-07-01",
    shop_id: "shop-kinhdoanh",
    revenue_date: "2024-07-01",
    revenue_amount: 12000000,
    uploaded_by: "user-leader-sales",
    created_at: baseDate,
  },
  {
    id: "revenue-kinhdoanh-2024-07-02",
    shop_id: "shop-kinhdoanh",
    revenue_date: "2024-07-02",
    revenue_amount: 14500000,
    uploaded_by: "user-leader-sales",
    created_at: baseDate,
  },
  {
    id: "revenue-chamsoc-2024-07-01",
    shop_id: "shop-chamsoc",
    revenue_date: "2024-07-01",
    revenue_amount: 5000000,
    uploaded_by: "user-head-sales",
    created_at: baseDate,
  },
  {
    id: "revenue-chamsoc-2024-07-02",
    shop_id: "shop-chamsoc",
    revenue_date: "2024-07-02",
    revenue_amount: 6200000,
    uploaded_by: "user-head-sales",
    created_at: baseDate,
  },
];

const exerciseProgress: UserExerciseProgress[] = [
  {
    id: "progress-hoa-ex1",
    user_id: "user-staff-hoa",
    exercise_id: "exercise-intro",
    is_completed: true,
    video_completed: true,
    recap_submitted: true,
    quiz_passed: true,
    theory_read: true,
    time_spent: 5400,
    video_view_count: 2,
    video_duration: 1800,
    watch_percentage: 100,
    session_count: 3,
    notes: "Đã hoàn thành nội dung",
    completed_at: "2024-06-15T03:00:00.000Z",
    created_at: baseDate,
    updated_at: baseDate,
  },
];

const bannerImages = new Map<string, BannerImage>();

export interface UserFilters {
  page: number;
  pageSize: number;
  searchTerm?: string;
  selectedRole?: string;
  selectedTeam?: string;
  selectedManager?: string;
}

const findDepartment = (id: Nullable<string>) =>
  id ? departments.find((dept) => dept.id === id) || null : null;

const findProfile = (id: Nullable<string>) =>
  id ? profiles.find((profile) => profile.id === id) || null : null;

const hydrateProfile = (profile: SysProfile): HydratedProfile => {
  const department = findDepartment(profile.department_id);
  const managerProfile = findProfile(profile.manager_id);
  return {
    ...profile,
    departments: department ? cloneDeep(department) : null,
    manager: managerProfile
      ? {
          id: managerProfile.id,
          full_name: managerProfile.full_name,
          email: managerProfile.email,
        }
      : null,
  };
};

const buildMockUser = (profile: SysProfile): MockUser => ({
  id: profile.id,
  email: profile.email,
  user_metadata: {
    full_name: profile.full_name,
    role: profile.role,
    department_id: profile.department_id,
    work_type: profile.work_type,
  },
});

const applyUserFilters = (
  dataset: SysProfile[],
  filters: UserFilters,
): SysProfile[] => {
  const {
    searchTerm = "",
    selectedRole = "all",
    selectedTeam = "all",
    selectedManager = "all",
  } = filters;

  let records = dataset.filter((profile) => profile.role !== "deleted");

  if (selectedRole !== "all") {
    records = records.filter(
      (profile) => profile.role.toLowerCase() === selectedRole.toLowerCase(),
    );
  }

  if (selectedTeam === "no-team") {
    records = records.filter((profile) => !profile.department_id);
  } else if (selectedTeam !== "all") {
    records = records.filter(
      (profile) => profile.department_id === selectedTeam,
    );
  }

  if (selectedManager === "no-manager") {
    records = records.filter((profile) => !profile.manager_id);
  } else if (selectedManager !== "all") {
    records = records.filter(
      (profile) => profile.manager_id === selectedManager,
    );
  }

  if (searchTerm) {
    const keyword = searchTerm.trim().toLowerCase();
    records = records.filter((profile) => {
      const fullName = (profile.full_name || "").toLowerCase();
      const email = (profile.email || "").toLowerCase();
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }

  return records;
};

const sortByNewest = <T extends { created_at: string }>(rows: T[]) =>
  rows.slice().sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return timeB - timeA;
  });

const paginate = <T>(rows: T[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return rows.slice(start, end);
};

const updateTimestamps = <T extends { updated_at?: string }>(record: T) => {
  const iso = new Date().toISOString();
  if ("updated_at" in record) {
    (record as { updated_at: string }).updated_at = iso;
  }
  return record;
};

const removeFromArray = <T extends { id: string }>(
  rows: T[],
  id: string,
): boolean => {
  const index = rows.findIndex((row) => row.id === id);
  if (index >= 0) {
    rows.splice(index, 1);
    return true;
  }
  return false;
};

export const mockDatabase = {
  buildMockUser,

  async listDepartments(): Promise<SysDepartment[]> {
    return cloneDeep(sortByNewest(departments));
  },

  async createDepartment(name: string): Promise<SysDepartment> {
    const newDepartment: SysDepartment = {
      id: generateId(),
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    departments.push(newDepartment);
    return cloneDeep(newDepartment);
  },

  async updateDepartment(
    id: string,
    name: string,
  ): Promise<SysDepartment | null> {
    const department = departments.find((dept) => dept.id === id);
    if (!department) return null;
    department.name = name;
    department.updated_at = new Date().toISOString();
    return cloneDeep(department);
  },

  async deleteDepartment(id: string): Promise<boolean> {
    const deleted = removeFromArray(departments, id);
    if (deleted) {
      profiles.forEach((profile) => {
        if (profile.department_id === id) {
          profile.department_id = null;
          updateTimestamps(profile);
        }
      });
    }
    return deleted;
  },

  async listRoles(): Promise<SysRole[]> {
    const sorted = roles.slice().sort((a, b) => a.name.localeCompare(b.name));
    return cloneDeep(sorted);
  },

  async createRole(roleData: {
    name: RoleName | string;
    description?: string;
  }): Promise<SysRole> {
    const newRole: SysRole = {
      id: generateId(),
      name: roleData.name as RoleName,
      description: roleData.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    roles.push(newRole);
    return cloneDeep(newRole);
  },

  async updateRole(
    id: string,
    updates: Partial<Omit<SysRole, "id">>,
  ): Promise<SysRole | null> {
    const role = roles.find((item) => item.id === id);
    if (!role) return null;
    Object.assign(role, updates);
    role.updated_at = new Date().toISOString();
    return cloneDeep(role);
  },

  async deleteRole(id: string): Promise<boolean> {
    if (roles.find((role) => role.id === id) && roles.length <= 1) {
      return false;
    }
    return removeFromArray(roles, id);
  },

  async listLeaderOptions(): Promise<Array<{ id: string; full_name: string | null; email: string }>> {
    const leaders = profiles.filter((profile) =>
      ["leader", "trưởng phòng"].includes(profile.role),
    );
    return leaders
      .map((leader) => ({
        id: leader.id,
        full_name: leader.full_name,
        email: leader.email,
      }))
      .sort((a, b) => {
        const nameA = (a.full_name || a.email || "").toLowerCase();
        const nameB = (b.full_name || b.email || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  },

  async getProfileById(id: string): Promise<HydratedProfile | null> {
    const profile = findProfile(id);
    return profile ? hydrateProfile(profile) : null;
  },

  async getRawProfile(id: string): Promise<SysProfile | null> {
    return cloneDeep(findProfile(id));
  },

  async listUsers(
    filters: UserFilters,
  ): Promise<{ users: HydratedProfile[]; totalCount: number }> {
    const filtered = applyUserFilters(profiles, filters);
    const ordered = sortByNewest(filtered);
    const paged = paginate(ordered, filters.page, filters.pageSize);
    return {
      users: paged.map((profile) => hydrateProfile(profile)),
      totalCount: filtered.length,
    };
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
  }): Promise<{ profile: HydratedProfile; user: MockUser }> {
    if (authUsers.some((user) => user.email === params.email)) {
      throw new Error("Email đã tồn tại trong hệ thống");
    }

    const now = new Date().toISOString();
    const profile: SysProfile = {
      id: generateId(),
      email: params.email,
      full_name: params.full_name || null,
      phone: params.phone || null,
      role: params.role,
      work_type: params.work_type || "fulltime",
      department_id: params.department_id || null,
      manager_id: params.manager_id || null,
      join_date: params.join_date || null,
      created_at: now,
      updated_at: now,
    };
    profiles.push(profile);

    const authUser: AuthUser = {
      id: generateId(),
      email: params.email,
      password: params.password,
      profile_id: profile.id,
    };
    authUsers.push(authUser);

    return {
      profile: hydrateProfile(profile),
      user: buildMockUser(profile),
    };
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
  ): Promise<HydratedProfile | null> {
    const profile = profiles.find((item) => item.id === userId);
    if (!profile) return null;

    if (updates.email && updates.email !== profile.email) {
      if (authUsers.some((user) => user.email === updates.email)) {
        throw new Error("Email đã tồn tại trong hệ thống");
      }
    }

    const { password, ...rest } = updates;
    Object.assign(profile, rest);
    profile.updated_at = new Date().toISOString();

    if (updates.email) {
      const authUser = authUsers.find((user) => user.profile_id === profile.id);
      if (authUser) {
        authUser.email = updates.email;
      }
    }

    if (password) {
      const authUser = authUsers.find((user) => user.profile_id === profile.id);
      if (authUser) {
        authUser.password = password;
      }
    }

    return hydrateProfile(profile);
  },

  async deleteUser(userId: string): Promise<boolean> {
    const profile = findProfile(userId);
    if (!profile) return false;

    const removedProfile = removeFromArray(profiles, userId);
    if (!removedProfile) return false;

    const authIndex = authUsers.findIndex(
      (user) => user.profile_id === userId,
    );
    if (authIndex >= 0) {
      authUsers.splice(authIndex, 1);
    }

    shops.forEach((shop) => {
      if (shop.profile_id === userId) {
        shop.profile_id = null;
        shop.updated_at = new Date().toISOString();
      }
    });

    comprehensiveReports.forEach((report) => {
      if (report.shop_id && !shops.find((shop) => shop.id === report.shop_id)) {
        report.shop_id = "";
      }
    });

    return true;
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
    }>,
  ): Promise<{ created: number }> {
    let created = 0;
    for (const user of users) {
      try {
        await this.createUser(user);
        created++;
      } catch (error) {
        console.warn("Bulk create user failed:", error);
      }
    }
    return { created };
  },

  async listShops(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    status?: ShopStatus | "all";
  }): Promise<{ shops: Array<ShopeeShop & { profile: HydratedProfile | null }>; totalCount: number }> {
    const { page, pageSize, searchTerm = "", status = "all" } = params;
    let dataset = shops.slice();

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      dataset = dataset.filter((shop) =>
        shop.name.toLowerCase().includes(keyword),
      );
    }

    if (status !== "all") {
      dataset = dataset.filter((shop) => shop.status === status);
    }

    const ordered = dataset.sort((a, b) => a.name.localeCompare(b.name));
    const paged = paginate(ordered, page, pageSize);
    const enriched = paged.map((shop) => {
      const profile = shop.profile_id ? findProfile(shop.profile_id) : null;
      return {
        ...shop,
        profile: profile ? hydrateProfile(profile) : null,
      };
    });

    return { shops: cloneDeep(enriched), totalCount: dataset.length };
  },

  async createShop(data: {
    name: string;
    profile_id?: string | null;
    status?: ShopStatus;
    department_id?: string | null;
  }): Promise<ShopeeShop> {
    const now = new Date().toISOString();
    const newShop: ShopeeShop = {
      id: generateId(),
      name: data.name,
      profile_id: data.profile_id || null,
      status: data.status || "Đang Vận Hành",
      department_id: data.department_id || null,
      created_at: now,
      updated_at: now,
    };
    shops.push(newShop);
    return cloneDeep(newShop);
  },

  async updateShop(
    id: string,
    updates: Partial<Omit<ShopeeShop, "id" | "created_at">>,
  ): Promise<ShopeeShop | null> {
    const shop = shops.find((item) => item.id === id);
    if (!shop) return null;
    Object.assign(shop, updates);
    shop.updated_at = new Date().toISOString();
    return cloneDeep(shop);
  },

  async deleteShop(id: string): Promise<boolean> {
    const removed = removeFromArray(shops, id);
    if (!removed) return false;

    for (let i = shopRevenues.length - 1; i >= 0; i--) {
      if (shopRevenues[i].shop_id === id) {
        shopRevenues.splice(i, 1);
      }
    }
    for (let i = comprehensiveReports.length - 1; i >= 0; i--) {
      if (comprehensiveReports[i].shop_id === id) {
        comprehensiveReports.splice(i, 1);
      }
    }
    return true;
  },

  async listComprehensiveReports(): Promise<ShopeeComprehensiveReport[]> {
    return cloneDeep(comprehensiveReports);
  },

  async getReportsForMonth(month: string): Promise<ShopeeComprehensiveReport[]> {
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const filtered = comprehensiveReports.filter((report) => {
      const date = new Date(report.report_date);
      return (
        date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex
      );
    });
    return cloneDeep(filtered);
  },

  async upsertComprehensiveReport(params: {
    shopId: string;
    month: string;
    feasible_goal?: number | null;
    breakthrough_goal?: number | null;
  }): Promise<ShopeeComprehensiveReport[]> {
    const [yearStr, monthStr] = params.month.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const startIso = startDate.toISOString().split("T")[0];
    const endIso = endDate.toISOString().split("T")[0];

    const targets = comprehensiveReports.filter(
      (report) =>
        report.shop_id === params.shopId &&
        report.report_date >= startIso &&
        report.report_date <= endIso,
    );

    if (targets.length > 0) {
      targets.forEach((report) => {
        report.feasible_goal =
          params.feasible_goal ?? report.feasible_goal ?? null;
        report.breakthrough_goal =
          params.breakthrough_goal ?? report.breakthrough_goal ?? null;
        report.updated_at = new Date().toISOString();
      });
      return cloneDeep(targets);
    }

    const newReport: ShopeeComprehensiveReport = {
      id: generateId(),
      shop_id: params.shopId,
      report_date: startIso,
      total_revenue: 0,
      total_orders: 0,
      total_visits: 0,
      product_clicks: 0,
      average_order_value: null,
      conversion_rate: null,
      buyer_return_rate: null,
      cancelled_orders: null,
      cancelled_revenue: null,
      existing_buyers: null,
      new_buyers: null,
      potential_buyers: null,
      returned_orders: null,
      returned_revenue: null,
      total_buyers: null,
      feasible_goal: params.feasible_goal ?? null,
      breakthrough_goal: params.breakthrough_goal ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    comprehensiveReports.push(newReport);
    return [cloneDeep(newReport)];
  },

  async listShopRevenue(filters: {
    shopId?: string;
    month?: string;
  }): Promise<ShopeeShopRevenue[]> {
    let dataset = shopRevenues.slice();

    if (filters.shopId && filters.shopId !== "all") {
      dataset = dataset.filter((row) => row.shop_id === filters.shopId);
    }

    if (filters.month) {
      const [yearStr, monthStr] = filters.month.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      dataset = dataset.filter((row) => {
        const [rowYear, rowMonth] = row.revenue_date.split("-").map(Number);
        return rowYear === year && rowMonth === month;
      });
    }

    return cloneDeep(
      dataset.sort(
        (a, b) =>
          new Date(b.revenue_date).getTime() -
          new Date(a.revenue_date).getTime(),
      ),
    );
  },

  async listReportsWithShopDetails(month: string) {
    const reports = await this.getReportsForMonth(month);
    return reports.map((report) => {
      const shop = shops.find((item) => item.id === report.shop_id) || null;
      const profile =
        shop && shop.profile_id ? findProfile(shop.profile_id) : null;
      const manager =
        profile && profile.manager_id ? findProfile(profile.manager_id) : null;
      const department =
        shop && shop.department_id ? findDepartment(shop.department_id) : null;

      return {
        ...report,
        shops: shop
          ? {
              name: shop.name,
              profile: profile
                ? {
                    full_name: profile.full_name,
                    email: profile.email,
                    manager_id: profile.manager_id,
                    manager: manager
                      ? {
                          full_name: manager.full_name,
                          email: manager.email,
                        }
                      : null,
                  }
                : null,
            }
          : null,
        department,
      };
    });
  },

  async getMonthlyPerformance(months: number) {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1),
    );

    return comprehensiveReports
      .filter((report) => new Date(report.report_date) >= start)
      .map((report) => {
        const shop = shops.find((item) => item.id === report.shop_id) || null;
        const department =
          shop && shop.department_id ? findDepartment(shop.department_id) : null;
        const profile =
          shop && shop.profile_id ? findProfile(shop.profile_id) : null;
        return {
          ...report,
          shops: shop
            ? {
                ...shop,
                departments: department
                  ? {
                      id: department.id,
                      name: department.name,
                    }
                  : null,
                profile: profile
                  ? {
                      manager_id: profile.manager_id,
                    }
                  : null,
              }
            : null,
        };
      });
  },

  async getUserExerciseProgress(
    userId: string,
    exerciseId?: string,
  ): Promise<UserExerciseProgress | UserExerciseProgress[] | null> {
    if (exerciseId) {
      const record = exerciseProgress.find(
        (row) => row.user_id === userId && row.exercise_id === exerciseId,
      );
      return record ? cloneDeep(record) : null;
    }

    const records = exerciseProgress
      .filter((row) => row.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return cloneDeep(records);
  },

  async upsertExerciseProgress(
    userId: string,
    exerciseId: string,
    updates: Partial<UserExerciseProgress>,
  ): Promise<UserExerciseProgress> {
    let record = exerciseProgress.find(
      (row) => row.user_id === userId && row.exercise_id === exerciseId,
    );

    if (!record) {
      record = {
        id: generateId(),
        user_id: userId,
        exercise_id: exerciseId,
        is_completed: false,
        video_completed: false,
        recap_submitted: false,
        quiz_passed: false,
        theory_read: false,
        time_spent: 0,
        video_view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      exerciseProgress.push(record);
    }

    Object.assign(record, updates);
    record.updated_at = new Date().toISOString();
    return cloneDeep(record);
  },

  async listShopIdsByManager(managerId: string): Promise<string[]> {
    return shops
      .filter((shop) => {
        if (!shop.profile_id) return false;
        const profile = findProfile(shop.profile_id);
        return profile?.manager_id === managerId;
      })
      .map((shop) => shop.id);
  },

  async listBannerImages(): Promise<BannerImage[]> {
    return Array.from(bannerImages.values()).map((file) => cloneDeep(file));
  },

  async saveBannerImage(file: BannerImage): Promise<void> {
    bannerImages.set(file.id, file);
  },

  async removeBannerImage(id: string): Promise<boolean> {
    return bannerImages.delete(id);
  },

  async findAuthUserByEmail(email: string): Promise<AuthUser | null> {
    const user = authUsers.find(
      (candidate) =>
        candidate.email.trim().toLowerCase() === email.trim().toLowerCase(),
    );
    return user ? cloneDeep(user) : null;
  },

  async findAuthUserByProfileId(profileId: string): Promise<AuthUser | null> {
    const user = authUsers.find((candidate) => candidate.profile_id === profileId);
    return user ? cloneDeep(user) : null;
  },
};
