import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Search, Filter, Settings2, Users2, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/useUserProfile";
import PermissionsDialog from "./PermissionsDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RolePermissionsMatrix from "./RolePermissionsMatrix";

const PermissionManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useUsers({
    page: 1,
    pageSize: 1000,
    searchTerm: debouncedSearchTerm,
    selectedRole: roleFilter,
    selectedTeam: "all", // Let client handle team filtering by name
    selectedManager: "all",
  });

  const users = data?.users || [];

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (!showInactiveUsers && user.role === 'deleted') return false;
      
      // Handle team filtering
      if (teamFilter === "unassigned" && user.teams?.name) return false;
      if (teamFilter !== "all" && teamFilter !== "unassigned" && user.teams?.name !== teamFilter) return false;
      
      return true;
    });
  }, [users, showInactiveUsers, teamFilter]);

  // Get unique roles and teams for filters
  const availableRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role).filter(Boolean));
    return Array.from(roles);
  }, [users]);

  const availableTeams = useMemo(() => {
    const teamStats = users.reduce((acc, user) => {
      if (user.teams?.name) {
        acc[user.teams.name] = (acc[user.teams.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(teamStats).map(([name, count]) => ({ name, count }));
  }, [users]);

  const handleManagePermissions = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }, []);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'leader': 'bg-blue-100 text-blue-800 border-blue-200',
      'chuyên viên': 'bg-green-100 text-green-800 border-green-200',
      'học việc/thử việc': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'trưởng phòng': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setTeamFilter('all');
    setShowInactiveUsers(false);
  };

  return (
    <>
      <Tabs defaultValue="user-permissions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user-permissions">Phân quyền người dùng</TabsTrigger>
          <TabsTrigger value="role-permissions">Quyền theo vai trò</TabsTrigger>
        </TabsList>
        <TabsContent value="user-permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
              </CardTitle>
              {/* Removed CardDescription */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo tên, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                        <SelectItem value="unassigned">
                          Chưa phân công ({users.filter(u => !u.teams?.name).length})
                        </SelectItem>
                        {availableTeams.map(team => (
                          <SelectItem key={team.name} value={team.name}>
                            {team.name} ({team.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInactiveUsers(!showInactiveUsers)}
                      className={showInactiveUsers ? "bg-muted" : ""}
                    >
                      {showInactiveUsers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {showInactiveUsers ? "Ẩn" : "Hiện"} vô hiệu
                    </Button>
                  </div>
                </div>
                
                {/* Active Filters Display */}
                {(roleFilter !== 'all' || teamFilter !== 'all' || searchTerm || showInactiveUsers) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Bộ lọc:</span>
                    {roleFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Vai trò: {roleFilter}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => setRoleFilter('all')}
                        >
                          ×
                        </Button>
                      </Badge>
                    )}
                    {teamFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Phòng: {teamFilter}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => setTeamFilter('all')}
                        >
                          ×
                        </Button>
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        Tìm: "{searchTerm}"
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => setSearchTerm('')}
                        >
                          ×
                        </Button>
                      </Badge>
                    )}
                    {showInactiveUsers && (
                      <Badge variant="secondary">Hiển thị vô hiệu hóa</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                )}
                
                <Separator />
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Thông tin người dùng</TableHead>
                      <TableHead className="w-[150px]">Vai trò</TableHead>
                      <TableHead className="w-[180px]">Phòng ban</TableHead>
                      <TableHead className="w-[100px]">Trạng thái</TableHead>
                      <TableHead className="text-right w-[120px]">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Đang tải...</TableCell>
                      </TableRow>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="font-medium text-sm">{user.full_name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)} variant="outline">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {user.teams?.name ? (
                                <span className="text-sm font-medium">{user.teams.name}</span>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 w-fit">
                                  Chưa phân công
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role !== 'deleted' ? 'default' : 'secondary'}
                              className={user.role !== 'deleted' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            >
                              {user.role !== 'deleted' ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleManagePermissions(user)}
                              className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Phân quyền
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Users2 className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              {searchTerm || roleFilter !== 'all' || teamFilter !== 'all' ? 
                                'Không tìm thấy người dùng phù hợp với bộ lọc.' : 
                                'Chưa có người dùng nào.'
                              }
                            </div>
                            {(searchTerm || roleFilter !== 'all' || teamFilter !== 'all') && (
                              <Button variant="outline" size="sm" onClick={clearFilters}>
                                Xóa bộ lọc
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Results Summary */}
              {filteredUsers.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Hiển thị {filteredUsers.length} người dùng
                  {(roleFilter !== 'all' || teamFilter !== 'all' || searchTerm) && (
                    <span> (đã lọc từ {users.length} tổng cộng)</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="role-permissions" className="mt-4">
          <RolePermissionsMatrix />
        </TabsContent>
      </Tabs>
      
      {selectedUser && (
        <PermissionsDialog
          user={selectedUser}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
};

export default PermissionManagementPage;