
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "./UserManagement";

const AdminUserManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý tài khoản người dùng, phân quyền và nhóm làm việc
        </p>
      </div>

      <UserManagement />
    </div>
  );
};

export default AdminUserManagement;
