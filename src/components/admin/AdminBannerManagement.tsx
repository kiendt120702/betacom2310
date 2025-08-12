
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image, Clock, CheckCircle, XCircle } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";

const AdminBannerManagement = () => {
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

  const bannerStats = [
    {
      title: "Tổng Banner",
      value: banners?.length || 0,
      icon: Image,
      color: "text-blue-600",
    },
    {
      title: "Chờ duyệt",
      value: banners?.filter(b => b.status === 'pending').length || 0,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Đã duyệt",
      value: banners?.filter(b => b.status === 'approved').length || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Từ chối",
      value: banners?.filter(b => b.status === 'rejected').length || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Banner</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và duyệt các banner được tải lên hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm Banner
        </Button>
      </div>

      {/* Banner Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {bannerStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Banner Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tính năng quản lý banner sẽ được tích hợp ở đây
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBannerManagement;
