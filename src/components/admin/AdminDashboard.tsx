
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, BarChart3, Activity } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useBanners } from "@/hooks/useBanners";

const AdminDashboard = () => {
  const { data: users } = useUsers();
  
  // Provide default parameters for useBanners
  const { data: bannersData } = useBanners({
    page: 1,
    pageSize: 1000, // Get all banners for stats
    searchTerm: "",
    selectedCategory: "all",
    selectedType: "all",
    selectedStatus: "all",
    sortBy: "created_desc"
  });

  const banners = bannersData?.banners || [];

  const stats = [
    {
      title: "Tổng người dùng",
      value: users?.length || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng Banner",
      value: banners?.length || 0,
      icon: Image,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Banner chờ duyệt",
      value: banners?.filter(b => b.status === 'pending').length || 0,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Hoạt động hôm nay",
      value: "12",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan Admin</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi hoạt động của hệ thống
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Người dùng mới đăng ký</span>
                <span className="text-xs text-muted-foreground ml-auto">2 phút trước</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Banner mới được tải lên</span>
                <span className="text-xs text-muted-foreground ml-auto">5 phút trước</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Banner chờ duyệt</span>
                <span className="text-xs text-muted-foreground ml-auto">10 phút trước</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="text-sm font-medium">2.1GB / 4GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm font-medium">1.2TB / 2TB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
