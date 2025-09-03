import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  Star,
  Truck,
  Bot,
  Search,
  GraduationCap,
  BarChart3,
  Settings,
  FileText,
  Users,
  Store,
  TrendingUp,
  AlertTriangle,
  Award,
  ArrowRight,
  Zap,
  Target,
  Calendar,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import { useThumbnails } from "@/hooks/useThumbnails";
import { format } from "date-fns";
import StatCard from "@/components/dashboard/StatCard";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const [selectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [previousMonth] = useState(format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "yyyy-MM"));

  const { isLoading, monthlyShopTotals } = useComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel: "all",
    debouncedSearchTerm: "",
    sortConfig: null,
  });

  const { isLoading: isLoadingPrevious, monthlyShopTotals: previousMonthShopTotals } = useComprehensiveReportData({
    selectedMonth: previousMonth,
    selectedLeader: "all",
    selectedPersonnel: "all",
    debouncedSearchTerm: "",
    sortConfig: null,
  });

  // Get recent thumbnails for display
  const { data: thumbnailsData, isLoading: thumbnailsLoading } = useThumbnails({
    page: 1,
    pageSize: 5,
    searchTerm: "",
    selectedCategory: "all",
    selectedType: "all",
    sortBy: "created_desc",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  // Function to calculate stats for a given month data
  const calculateMonthStats = (shopTotals: any[]) => {
    if (!shopTotals.length) {
      return {
        totalShops: 0,
        breakthroughMet: 0,
        feasibleMet: 0,
        underperforming: 0,
        noGoals: 0,
      };
    }

    const totalShops = shopTotals.length;
    let breakthroughMet = 0;
    let feasibleMet = 0;
    let underperforming = 0;
    let noGoals = 0;

    shopTotals.forEach((shop) => {
      const projectedRevenue = shop.projected_revenue || 0;
      const feasibleGoal = shop.feasible_goal;
      const breakthroughGoal = shop.breakthrough_goal;

      // Count shops without goals (only when both are null)
      if (feasibleGoal == null && breakthroughGoal == null) {
        noGoals++;
        return;
      }

      if (projectedRevenue <= 0 || !feasibleGoal || feasibleGoal <= 0) {
        return;
      }

      if (breakthroughGoal && projectedRevenue > breakthroughGoal) {
        breakthroughMet++;
      } else if (projectedRevenue >= feasibleGoal) {
        feasibleMet++;
      } else if (projectedRevenue < feasibleGoal * 0.8) {
        underperforming++;
      }
    });

    return {
      totalShops,
      breakthroughMet,
      feasibleMet,
      underperforming,
      noGoals,
    };
  };

  const currentMonthStats = useMemo(() => calculateMonthStats(monthlyShopTotals), [monthlyShopTotals]);
  const previousMonthStats = useMemo(() => calculateMonthStats(previousMonthShopTotals), [previousMonthShopTotals]);
  
  const recentThumbnails = thumbnailsData?.thumbnails || [];

  const quickActions = [
    {
      title: "Dashboard",
      icon: BarChart3,
      path: "/sales-dashboard",
      color: "bg-blue-500",
    },
    {
      title: "Báo cáo",
      icon: FileText,
      path: "/comprehensive-reports",
      color: "bg-green-500",
    },
    {
      title: "Mục tiêu",
      icon: Target,
      path: "/goal-setting",
      color: "bg-purple-500",
    },
    {
      title: "Quản lý Shop",
      icon: Store,
      path: "/shop-management",
      color: "bg-orange-500",
    },
  ];

  const featureCategories = [
    {
      title: "Báo cáo & Dashboard",
      features: [
        {
          title: "Sales Dashboard",
          description: "Tổng quan hiệu suất và thống kê chi tiết.",
          icon: BarChart3,
          path: "/sales-dashboard",
          badge: "Hot",
        },
        {
          title: "Báo cáo tổng hợp",
          description: "Báo cáo chi tiết theo shop, leader, nhân viên.",
          icon: FileText,
          path: "/comprehensive-reports",
        },
        {
          title: "Báo cáo hàng ngày",
          description: "Báo cáo doanh thu và hiệu suất hàng ngày.",
          icon: Calendar,
          path: "/daily-sales-report",
        },
      ],
    },
    {
      title: "Quản lý",
      features: [
        {
          title: "Quản lý Shop",
          description: "Thêm, sửa, xóa thông tin shop và nhân viên.",
          icon: Store,
          path: "/shop-management",
        },
        {
          title: "Thiết lập mục tiêu",
          description: "Đặt mục tiêu doanh thu cho các shop.",
          icon: Target,
          path: "/goal-setting",
        },
        {
          title: "Quản lý nhân sự",
          description: "Quản lý team và phân quyền nhân viên.",
          icon: Users,
          path: "/leader-personnel",
        },
      ],
    },
    {
      title: "Công cụ hỗ trợ",
      features: [
        {
          title: "Thư viện Thumbnail",
          description: "Quản lý, duyệt và tìm kiếm thumbnail hiệu quả.",
          icon: LayoutGrid,
          path: "/thumbnail",
        },
        {
          title: "Tính Điểm Đánh Giá",
          description: "Công cụ tính toán điểm trung bình và số sao cần thiết.",
          icon: Star,
          path: "/average-rating",
        },
        {
          title: "Giao Hàng Nhanh",
          description: "Lý thuyết và công cụ tính tỷ lệ giao hàng nhanh.",
          icon: Truck,
          path: "/fast-delivery/theory",
        },
        {
          title: "ChatGPT",
          description: "Trò chuyện và nhận hỗ trợ từ AI GPT-4o.",
          icon: Bot,
          path: "/gpt4o-mini",
        },
      ],
    },
    {
      title: "Đào tạo",
      features: [
        {
          title: "Nội dung đào tạo",
          description: "Quy trình và nội dung đào tạo cho nhân viên.",
          icon: GraduationCap,
          path: "/training-content",
        },
        {
          title: "Tiến độ học tập",
          description: "Theo dõi tiến độ học tập của nhân viên.",
          icon: TrendingUp,
          path: "/learning-progress",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Chào mừng trở lại,{" "}
          <span className="text-primary">
            {userProfile?.full_name || userProfile?.email || "bạn"}
          </span>
          ! 👋
        </h1>
      </div>

      {/* Thumbnail Gallery Preview */}
      {!thumbnailsLoading && recentThumbnails.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Thư viện Thumbnail</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/thumbnail")}
              className="text-primary hover:text-primary-foreground"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {recentThumbnails.slice(0, 5).map((thumbnail) => (
              <div
                key={thumbnail.id}
                className="group cursor-pointer"
                onClick={() => navigate("/thumbnail")}
              >
                <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={thumbnail.image_url}
                    alt={thumbnail.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate" title={thumbnail.name}>
                  {thumbnail.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Overview */}
      {!isLoading && !isLoadingPrevious && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Báo Cáo Tổng Hợp
          </h2>
          
          {/* Current Month Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-blue-600">Tháng {format(new Date(), "MM/yyyy")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Tổng số shop vận hành"
                value={currentMonthStats.totalShops}
                icon={Store}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                title="Shop đạt đột phá"
                value={currentMonthStats.breakthroughMet}
                icon={Award}
                className="bg-green-50 dark:bg-green-900/20"
              />
              <StatCard
                title="Shop đạt khả thi"
                value={currentMonthStats.feasibleMet}
                icon={Target}
                className="bg-yellow-50 dark:bg-yellow-900/20"
              />
              <StatCard
                title="Shop khả thi chưa đạt 80%"
                value={currentMonthStats.underperforming}
                icon={AlertTriangle}
                className="bg-red-50 dark:bg-red-900/20"
              />
            </div>
          </div>

          {/* Previous Month Stats */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-600">Tháng {format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "MM/yyyy")} (tháng trước)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Tổng số shop vận hành"
                value={previousMonthStats.totalShops}
                icon={Store}
                className="bg-gray-50 dark:bg-gray-900/20"
              />
              <StatCard
                title="Shop đạt đột phá"
                value={previousMonthStats.breakthroughMet}
                icon={Award}
                className="bg-gray-50 dark:bg-gray-900/20"
              />
              <StatCard
                title="Shop đạt khả thi"
                value={previousMonthStats.feasibleMet}
                icon={Target}
                className="bg-gray-50 dark:bg-gray-900/20"
              />
              <StatCard
                title="Shop khả thi chưa đạt 80%"
                value={previousMonthStats.underperforming}
                icon={AlertTriangle}
                className="bg-gray-50 dark:bg-gray-900/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="group hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(action.path)}>
                <CardContent className="p-6 text-center">
                  <div
                    className={`inline-flex p-4 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Categories */}
      <div className="space-y-8">
        {featureCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(feature.path)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {feature.title}
                              {feature.badge && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs">
                                  {feature.badge}
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">
                        {feature.description}
                      </p>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;