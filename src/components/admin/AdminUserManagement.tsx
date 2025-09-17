import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Users2, Briefcase, Plus, BarChart3, Upload, X } from "lucide-react";
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
import BulkUserImportDialog from "./BulkUserImportDialog";

const AdminUserManagement = () => {
  const { data: userProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(userProfile);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedManager, setSelectedManager] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading, refetch } = useUsers({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: debouncedSearchTerm,
    selectedRole,
    selectedTeam,
    selectedManager,
  });
  
  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);


  const { data: roles } = useRoles();
  const { data: teams } = useTeams();
  
  // Fetch all leaders for manager filter
  const { data: allLeadersData } = useUsers({
    page: 1,
    pageSize: 1000,
    searchTerm: "",
    selectedRole: "leader",
    selectedTeam: "all",
    selectedManager: "all",
  });
  const allLeaders = allLeadersData?.users || [];

  const filteredRoleOptions = useMemo(() => {
    if (!roles) return [];
    let options = roles.filter(role => role.name !== 'deleted'); // Filter out 'deleted' role
    if (isLeader) {
      options = options.filter(
        (r) => r.name === "chuyên viên" || r.name === "học việc/thử việc",
      );
    }
    // Map display names for the dropdown
    return options.map(role => ({
      ...role,
      displayName: role.name.toLowerCase() === 'admin' ? 'Super Admin' : 
                   role.name.toLowerCase() === 'leader' ? 'Team Leader' :
                   role.name.toLowerCase() === 'chuyên viên' ? 'Chuyên Viên' :
                   role.name.toLowerCase() === 'học việc/thử việc' ? 'Học Việc/Thử Việc' :
                   role.name.toLowerCase() === 'trưởng phòng' ? 'Trưởng Phòng' :
                   role.name
    }));
  }, [roles, isAdmin, isLeader]);

  const filteredTeamOptions = useMemo(() => {
    if (!teams) return [];
    if (isAdmin) return teams;
    if (isLeader && userProfile?.team_id) return teams.filter(team => team.id === userProfile.team_id);
    return [];
  }, [teams, isAdmin, isLeader, userProfile]);

  useEffect(() => {
    if (selectedRole !== "all" && !filteredRoleOptions.some(r => r.name.toLowerCase() === selectedRole)) {
      setSelectedRole("all");
    }
  }, [selectedRole, filteredRoleOptions]);

  useEffect(() => {
    if (
      selectedTeam !== "all" &&
      selectedTeam !== "no-team" &&
      !filteredTeamOptions.some((t) => t.id === selectedTeam)
    ) {
      setSelectedTeam("all");
    }
  }, [selectedTeam, filteredTeamOptions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedRole, selectedTeam, selectedManager]);

  // Auto-set manager filter for leaders
  useEffect(() => {
    if (isLeader && userProfile?.id && selectedManager === "all") {
      setSelectedManager(userProfile.id);
    }
  }, [isLeader, userProfile?.id, selectedManager]);

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedRole("all");
    setSelectedTeam("all");
    // Leaders cannot clear manager filter - keep it as their own ID
    if (!isLeader) {
      setSelectedManager("all");
    }
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedRole !== "all" || selectedTeam !== "all" || 
    (!isLeader && selectedManager !== "all") || searchTerm !== "";

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const processedUsers = useMemo(() => {
    if (!users) return [];
    const result: any[] = [];
    users.forEach(user => {
      if (user.profile_segment_roles && user.profile_segment_roles.length > 0) {
        user.profile_segment_roles.forEach((psr, index) => {
          result.push({
            ...user,
            isFirstRow: index === 0,
            rowSpan: user.profile_segment_roles.length,
            segmentRoleData: psr,
          });
        });
      } else {
        result.push({
          ...user,
          isFirstRow: true,
          rowSpan: 1,
          segmentRoleData: null,
        });
      }
    });
    return result;
  }, [users]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
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
            Phòng ban
          </TabsTrigger>
          <TabsTrigger value="work-types" className="flex items-center gap-2" disabled={!isAdmin}>
            <Briefcase className="h-4 w-4" />
            Hình thức làm việc
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
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {isLeader ? "Nhân sự dưới quyền" : "Quản lý nhân sự"}
                    </CardTitle>
                    {isLeader && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Danh sách nhân sự mà bạn đang quản lý trực tiếp
                      </p>
                    )}
                  </div>
                </div>
                {(isAdmin || isLeader) && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import hàng loạt
                    </Button>
                    <AddUserDialog
                      open={isAddUserDialogOpen}
                      onOpenChange={setIsAddUserDialogOpen}
                      onSuccess={() => refetch()}
                    >
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm người dùng
                      </Button>
                    </AddUserDialog>
                  </div>
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value.toLowerCase())} disabled={!isAdmin && !isLeader}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Lọc theo vai trò">
                          {selectedRole === "all"
                            ? "Lọc theo vai trò"
                            : filteredRoleOptions.find(r => r.name.toLowerCase() === selectedRole)?.displayName || selectedRole}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Lọc theo vai trò</SelectItem>
                        {filteredRoleOptions?.map(role => <SelectItem key={role.id} value={role.name.toLowerCase()}>{role.displayName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={!isAdmin && !isLeader}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Lọc theo phòng ban">
                          {selectedTeam === "all"
                            ? "Lọc theo phòng ban"
                            : selectedTeam === "no-team"
                            ? "Không có phòng ban"
                            : filteredTeamOptions.find(t => t.id === selectedTeam)?.name || selectedTeam}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Lọc theo phòng ban</SelectItem>
                        <SelectItem value="no-team">Không có phòng ban</SelectItem>
                        {filteredTeamOptions?.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {/* Manager filter - only show for admin */}
                    {isAdmin && (
                      <Select value={selectedManager} onValueChange={setSelectedManager}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Lọc theo leader quản lý">
                            {selectedManager === "all"
                              ? "Lọc theo leader quản lý"
                              : selectedManager === "no-manager"
                              ? "Không có leader"
                              : allLeaders.find(l => l.id === selectedManager)?.full_name || allLeaders.find(l => l.id === selectedManager)?.email || selectedManager}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Lọc theo leader quản lý</SelectItem>
                          <SelectItem value="no-manager">Không có leader</SelectItem>
                          {allLeaders?.map(leader => (
                            <SelectItem key={leader.id} value={leader.id}>
                              {leader.full_name || leader.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {/* Clear filters button */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <X className="h-4 w-4" />
                      Xoá bộ lọc
                    </Button>
                  )}
                </div>
              </div>
              <UserTable 
                users={processedUsers} 
                currentUser={userProfile} 
                onRefresh={refetch}
              />
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, totalCount)} của {totalCount} người dùng
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"} 
                        />
                      </PaginationItem>
                      {paginationRange?.map((pageNumber, index) => {
                        if (pageNumber === DOTS) {
                          return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                        }
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink 
                              onClick={() => setCurrentPage(pageNumber as number)} 
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer hover:bg-accent"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-accent"} 
                        />
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
      <BulkUserImportDialog 
        open={isBulkImportOpen} 
        onOpenChange={setIsBulkImportOpen} 
        onSuccess={refetch} 
      />
    </div>
  );
};

export default AdminUserManagement;