import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutGrid,
  Star,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  const mainFeatures = [
    {
      title: "Thư Viện Thumbnail",
      description: "Quản lý, duyệt và tìm kiếm thumbnail hiệu quả",
      icon: LayoutGrid,
      path: "/thumbnail",
      color: "border-blue-200 hover:border-blue-400",
    },
    {
      title: "Giao Hàng Nhanh",
      description: "Công cụ tính toán tỷ lệ giao hàng nhanh",
      icon: Truck,
      path: "/fast-delivery",
      color: "border-green-200 hover:border-green-400",
    },
    {
      title: "Tính Điểm Trung Bình",
      description: "Công cụ tính toán điểm đánh giá trung bình",
      icon: Star,
      path: "/average-rating",
      color: "border-purple-200 hover:border-purple-400",
    },
    {
      title: "Báo Cáo Tổng Hợp",
      description: "Xem báo cáo tổng hợp và dashboard chi tiết",
      icon: Star,
      path: "/shopee-comprehensive-reports",
      color: "border-orange-200 hover:border-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Welcome Section - Center Top */}
      <div className="pt-8 text-center">
        <h1 className="text-3xl font-bold mb-8">
          Chào mừng trở lại, <span className="text-red-500">Betacom</span>! 👋
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Main Features - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={`cursor-pointer border-2 ${feature.color} hover:shadow-lg transition-all duration-200`}
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-black mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;