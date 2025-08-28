import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginHistoryTable from "@/components/admin/LoginHistoryTable";
import ActiveSessionsTable from "@/components/admin/ActiveSessionsTable";
import { Shield, Globe, Monitor } from "lucide-react";

const LoginTrackingPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Theo dõi Đăng nhập</h1>
          <p className="text-muted-foreground">
            Giám sát địa chỉ IP và thiết bị đăng nhập của người dùng
          </p>
        </div>
      </div>

      <Tabs defaultValue="login-history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login-history" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Lịch sử đăng nhập
          </TabsTrigger>
          <TabsTrigger value="active-sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Phiên hoạt động
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login-history">
          <LoginHistoryTable showUserColumn={true} limit={200} />
        </TabsContent>

        <TabsContent value="active-sessions">
          <ActiveSessionsTable showUserColumn={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginTrackingPage;