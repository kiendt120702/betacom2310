import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutGrid,
  Star,
  Truck,
  Bot,
  Search,
  GraduationCap,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile"; // Import useUserProfile

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile(); // Lấy thông tin user profile

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  const features = [
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
    {
      title: "SEO Tên Sản Phẩm",
      description: "Tạo tên sản phẩm chuẩn SEO cho Shopee.",
      icon: Search,
      path: "/seo-product-name",
    },
    {
      title: "Đào tạo",
      description: "Quy trình và nội dung đào tạo cho nhân viên.",
      icon: GraduationCap,
      path: "/training-process",
    },
  ];

  return (
    <div className="space-y-8">
      {/* New Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Chào mừng,{" "}
          <span className="text-primary">
            {userProfile?.full_name || userProfile?.email || "bạn"}
          </span>
          !
        </h1>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Các chức năng chính
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => navigate(feature.path)}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;