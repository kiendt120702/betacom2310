
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useManagementAuth } from "@/hooks/useManagementAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ManagementContent from "./ManagementContent";

const ManagementLayout: React.FC = () => {
  const { data: userProfile } = useUserProfile();
  const { hasAccess, isLoading } = useManagementAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-profile");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Truy cập bị từ chối</CardTitle>
            <CardDescription>
              Bạn không có quyền truy cập vào trang quản lý này.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quản lý</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý hồ sơ cá nhân
              </p>
            </div>
            {userProfile?.role === "admin" && (
              <Button 
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 max-w-md">
            <TabsTrigger value="my-profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hồ sơ của tôi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-profile">
            <ManagementContent activeTab={activeTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagementLayout;
