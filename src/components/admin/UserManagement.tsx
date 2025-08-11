import React from "react";
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

const UserManagement = () => {
  const { data: userProfile } = useUserProfile();
  const { data: users, isLoading, refetch } = useUsers();
  const isAdmin = userProfile?.role === "admin";
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);

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
            Quản lý Team
          </TabsTrigger>
          <TabsTrigger value="learning-progress" className="flex items-center gap-2" disabled={!isAdmin && userProfile?.role !== 'leader'}>
            <BarChart3 className="h-4 w-4" />
            Tiến độ học tập
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
                {isAdmin && (
                  <AddUserDialog
                    open={isAddUserDialogOpen}
                    onOpenChange={setIsAddUserDialogOpen}
                    onSuccess={refetch}
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
              <UserTable 
                users={users || []} 
                currentUser={userProfile} 
                onRefresh={refetch}
              />
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

        <TabsContent value="learning-progress" className="space-y-4">
          <LearningProgressDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;