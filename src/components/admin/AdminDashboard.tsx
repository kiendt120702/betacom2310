import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, Clock, CheckCircle, XCircle, Folder } from "lucide-react";
import { useBannerStatistics } from "@/hooks/useBannerStatistics";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { data: statsData, isLoading } = useBannerStatistics();

  const stats = [
    {
      title: "Tổng người dùng",
      value: statsData?.total_users || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng Banner",
      value: statsData?.total_banners || 0,
      icon: Image,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Banner chờ duyệt",
      value: statsData?.pending_banners || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Banner đã duyệt",
      value: statsData?.approved_banners || 0,
      icon: CheckCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Banner bị từ chối",
      value: statsData?.rejected_banners || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Tổng danh mục",
      value: statsData?.total_categories || 0,
      icon: Folder,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng quan Admin</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi hoạt động của hệ thống
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan Admin</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi hoạt động của hệ thống
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
};

export default AdminDashboard;