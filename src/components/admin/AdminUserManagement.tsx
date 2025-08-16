import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Users2, Briefcase, Plus, BarChart3 } from "lucide-react";
import UserTable from "./UserTable";
import RoleManagement from "./RoleManagement";
import WorkTypeManagement from "./WorkTypeManagement";
import TeamManagement from "@/pages/admin/TeamManagement";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import AddUserDialog from "./AddUserDialog";
import LearningProgressDashboard from "./LearningProgressDashboard";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useDebounce } from "@/hooks/useDebounce";
import UserSearchFilter from "./UserSearchFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "@/hooks/useRoles";
import { useTeams } from "@/hooks/useTeams";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";

const AdminUserManagement = () => {
  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(userProfile);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, refetch } = useUsers({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    selectedRole,
    selectedTeam,
  });
  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { data: roles } = useRoles();
  const { data: teams } = useTeams();

  // Filtered roles for the dropdown based on current user's role
  const filteredRoleOptions = useMemo(() => {
    if (!roles) return [];
    if (isAdmin) {
      return roles; // Admin sees all roles
    }
    if (isLeader) {
      // Leader can only filter by roles they can see (chuyên viên, học việc/thử việc)
      return roles.filter(role => role.name === 'chuyên viên' || role.name === 'học việc/thử việc');
    }
    return []; // Other roles don't get role filter options
  }, [roles, isAdmin, isLeader]);

  // Filtered teams for the dropdown based on current user's role
  const filteredTeamOptions = useMemo(() => {
    if (!teams) return [];
    if (isAdmin) {
      return teams; // Admin sees all teams
    }
    if (isLeader && userProfile?.team_id) {
      // Leader can only filter by their own team
      return teams.filter(team => team.id === userProfile.team_id);
    }
    return []; // Other roles don't get team filter options
  }, [teams, isAdmin, isLeader, userProfile]);

  // If the currently selected role is no longer available, reset it to "all"
  useEffect(() => {
    if (selectedRole !== "all" && !filteredRoleOptions.some(r => r.name === selectedRole)) {
      setSelectedRole("all");
    }
  }, [selectedRole, filteredRoleOptions]);

  // If the currently selected team is no longer available, reset it to "all"
  useEffect(() => {
    if (selectedTeam !== "all" && !filteredTeamOptions.some(t => t.id === selectedTeam)) {
      setSelectedTeam("all");
    }
  }, [selectedTeam, filteredTeamOptions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedRole, selectedTeam]);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2" disabled={!isAdmin}>
            <Shield className="h-4 w-4" />
            Vai trò
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2" disabled={!isAdmin}>
            <Users2 className="h-4 w-4" />
            Quản lý Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">Quản lý nhân sự</CardTitle>
                  </div>
                </div>
                {(isAdmin || isLeader) && (
                  <AddUserDialog
                    open={isAddUserDialogOpen}
                    onOpenChange={setIsAddUserDialogOpen}
                    onSuccess={() => refetch()}
                  >
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm người dùng
                    </Button>
                  </AddUserDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <UserSearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  userCount={totalCount}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!isAdmin && !isLeader}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Lọc theo vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      {filteredRoleOptions?.map(role => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={!isAdmin && !isLeader}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Lọc theo team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả team</SelectItem>
                      {filteredTeamOptions?.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <UserTable 
                users={users} 
                currentUser={userProfile} 
                onRefresh={refetch}
              />
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      {paginationRange?.map((pageNumber, index) => {
                        if (pageNumber === DOTS) {
                          return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                        }
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink onClick={() => setCurrentPage(pageNumber as number)} isActive={currentPage === pageNumber}>
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="work-types" className="space-y-4">
          <WorkTypeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserManagement;