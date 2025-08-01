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
import { useBanners } from "@/hooks/useBanners";
import LazyImage from "@/components/LazyImage";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bannersData, isLoading } = useBanners({
    page: 1,
    pageSize: 10, // Display top 10 banners
    searchTerm: "",
    selectedCategory: "all",
    selectedType: "all",
    selectedStatus: "approved", // Only show approved banners on landing
  });

  const banners = bannersData?.banners || [];

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Chào mừng đến với Betacom!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Đây là trang chủ của bạn. Bạn có thể khám phá các tính năng của
              ứng dụng qua thanh điều hướng bên trái.
            </p>
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
            ) : banners.length === 0 ? (
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
                  {banners.map((banner) => (
                    <CarouselItem
                      key={banner.id}
                      className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="p-1">
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="aspect-video relative">
                            <LazyImage
                              src={banner.image_url}
                              alt={banner.name}
                              className="w-full h-full object-contain bg-muted"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium text-sm truncate mb-2">
                              {banner.name}
                            </h3>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{banner.categories?.name || "N/A"}</span>
                              <span>{banner.banner_types?.name || "N/A"}</span>
                            </div>
                            {banner.canva_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3 text-xs h-8"
                                onClick={() =>
                                  window.open(banner.canva_link!, "_blank")
                                }
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Mở Canva
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
    </div>
  );
};

export default Index;
