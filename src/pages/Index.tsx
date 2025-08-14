import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useThumbnails } from "@/hooks/useThumbnails";
import LazyImage from "@/components/LazyImage";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  LayoutGrid,
  Star,
  Truck,
  Bot,
  Search,
  GraduationCap,
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: thumbnailsData, isLoading } = useThumbnails({
    page: 1,
    pageSize: 10, // Display top 10 thumbnails
    searchTerm: "",
    selectedCategory: "all",
    // Removed selectedStatus: "approved", // No longer filter by status on homepage
  });

  const thumbnails = thumbnailsData?.thumbnails || [];

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
      description: "Công cụ tính điểm trung bình và số sao cần thiết.",
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
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Chào mừng đến với Betacom!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đây là trang chủ của bạn. Bạn có thể khám phá các tính năng của ứng
            dụng qua thanh điều hướng bên trái hoặc các chức năng chính dưới
            đây.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Các chức năng chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {feature.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Các Thumbnail Nổi Bật
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Đang tải thumbnail...</p>
            </div>
          ) : thumbnails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Chưa có thumbnail nổi bật nào.
              </p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {thumbnails.map((thumbnail) => (
                  <CarouselItem
                    key={thumbnail.id}
                    className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="p-1">
                      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="aspect-video relative">
                          <LazyImage
                            src={thumbnail.image_url}
                            alt={thumbnail.name}
                            className="w-full h-full object-contain bg-muted"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm truncate mb-2">
                            {thumbnail.name}
                          </h3>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{thumbnail.categories?.name || "N/A"}</span>
                            <span>
                              {thumbnail.banner_types?.name || "N/A"}
                            </span>
                          </div>
                          {thumbnail.canva_link && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 text-xs h-8"
                              onClick={() =>
                                window.open(thumbnail.canva_link!, "_blank")
                              }
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Xem thiết kế
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;