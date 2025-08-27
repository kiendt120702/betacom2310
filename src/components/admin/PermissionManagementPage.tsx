import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/useUserProfile";
import PermissionsDialog from "./PermissionsDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RolePermissionsMatrix from "./RolePermissionsMatrix";

const PermissionManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useUsers({
    page: 1,
    pageSize: 1000, // Fetch all users for this interface
    searchTerm: debouncedSearchTerm,
    selectedRole: "all",
    selectedTeam: "all",
    selectedManager: "all",
  });

  const users = data?.users || [];

  const handleManagePermissions = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
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
                Phân quyền người dùng
              </CardTitle>
              <CardDescription>
                Quản lý vai trò và các quyền hạn chi tiết cho từng người dùng trong hệ thống.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Đang tải...</TableCell>
                      </TableRow>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleManagePermissions(user)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Phân quyền
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Không tìm thấy người dùng.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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