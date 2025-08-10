
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Users2, Briefcase } from "lucide-react";
import UserTable from "./UserTable";
import RoleManagement from "./RoleManagement";
import WorkTypeManagement from "./WorkTypeManagement";
import TeamManagement from "@/pages/admin/TeamManagement";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUsers } from "@/hooks/useUsers";

const UserManagement = () => {
  const { data: userProfile } = useUserProfile();
  const { data: users, isLoading, refetch } = useUsers();
  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin người dùng, vai trò và hình thức làm việc
        </p>
      </div>

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
            Quản lý Team
          </TabsTrigger>
          <TabsTrigger value="work-types" className="flex items-center gap-2" disabled={!isAdmin}>
            <Briefcase className="h-4 w-4" />
            Hình thức
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Quản lý thông tin cá nhân và quyền hạn của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable 
                users={users || []} 
                currentUser={userProfile} 
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý vai trò</CardTitle>
              <CardDescription>
                Tạo, chỉnh sửa và xóa các vai trò trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="work-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý hình thức làm việc</CardTitle>
              <CardDescription>
                Cấu hình các hình thức làm việc có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkTypeManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
