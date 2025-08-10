
import React, { useState } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers } from "@/hooks/useUsers";
import { useUserProfile } from "@/hooks/useUserProfile";
import CreateUserDialog from "./CreateUserDialog";
import UserSearchFilter from "./UserSearchFilter";
import UserTable from "./UserTable";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserFiltering } from "@/hooks/useUserFiltering";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeams } from "@/hooks/useTeams";
import { Database } from "@/integrations/supabase/types";
import RoleManagement from "./RoleManagement";
import TeamManagement from "../../../pages/admin/TeamManagement";
import WorkTypeManagement from "./WorkTypeManagement";

type UserRole = Database["public"]["Enums"]["user_role"];

const UserManagement = () => {
  const { data: users, isLoading, refetch } = useUsers();
  const { data: currentUser } = useUserProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const { isAdmin, isLeader, canCreateUser } = useUserPermissions(currentUser);
  const filteredUsers = useUserFiltering(
    users,
    searchTerm,
    currentUser,
    selectedRole,
    selectedTeam,
  );

  if (isLoading || teamsLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isLeader) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Không có quyền truy cập
            </h3>
            <p className="text-muted-foreground mt-1">
              Bạn không có quyền truy cập trang này.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableRolesForFilter: UserRole[] = [
    "admin",
    "leader",
    "chuyên viên",
  ];

  return (
    <div className="space-y-6 bg-card rounded-lg shadow-sm border">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <CardTitle className="text-2xl">Quản lý hệ thống</CardTitle>
            <CardDescription className="mt-1">
              Quản lý người dùng, vai trò, team và hình thức làm việc
            </CardDescription>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="roles">Vai trò</TabsTrigger>
            <TabsTrigger value="teams">Team</TabsTrigger>
            <TabsTrigger value="work-types">Hình thức</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Danh sách người dùng</h3>
                  <p className="text-sm text-muted-foreground">
                    Tìm kiếm và quản lý thông tin người dùng
                  </p>
                </div>
                {canCreateUser && (
                  <div className="flex-shrink-0">
                    <CreateUserDialog onUserCreated={() => refetch()} />
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                <UserSearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  userCount={filteredUsers.length}
                />
                {isAdmin && (
                  <>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Lọc theo vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        {availableRolesForFilter.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role === "admin"
                              ? "Admin"
                              : role === "leader"
                                ? "Leader"
                                : "Chuyên viên"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Lọc theo team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
            <UserTable
              users={filteredUsers}
              currentUser={currentUser}
              onRefresh={() => refetch()}
            />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="teams">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="work-types">
            <WorkTypeManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagement;
