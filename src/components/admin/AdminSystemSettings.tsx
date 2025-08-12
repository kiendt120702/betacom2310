
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Database, Mail, Shield } from "lucide-react";

const AdminSystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground mt-2">
          Cấu hình và quản lý các thiết lập hệ thống
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cài đặt chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site-name">Tên website</Label>
              <Input id="site-name" defaultValue="Admin Panel" />
            </div>
            <div>
              <Label htmlFor="site-description">Mô tả</Label>
              <Input id="site-description" defaultValue="Hệ thống quản lý nội dung" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode">Chế độ bảo trì</Label>
              <Switch id="maintenance-mode" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="user-registration">Cho phép đăng ký</Label>
              <Switch id="user-registration" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Cài đặt Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" placeholder="587" />
            </div>
            <div>
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" placeholder="your-email@gmail.com" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Thông báo email</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cài đặt Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Kết nối Database</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Kết nối thành công</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Sao lưu Database
              </Button>
              <Button variant="outline" className="w-full">
                Khôi phục Database
              </Button>
              <Button variant="destructive" className="w-full">
                Xóa cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cài đặt bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">Xác thực 2 yếu tố</Label>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="session-timeout">Tự động đăng xuất</Label>
              <Switch id="session-timeout" defaultChecked />
            </div>
            <div>
              <Label htmlFor="max-login-attempts">Số lần đăng nhập tối đa</Label>
              <Input id="max-login-attempts" defaultValue="5" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ip-whitelist">Whitelist IP</Label>
              <Switch id="ip-whitelist" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
