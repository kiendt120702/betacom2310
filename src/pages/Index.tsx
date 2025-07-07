import React from 'react';
import AppHeader from '@/components/AppHeader';
import { useBanners } from '@/hooks/useBanners';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

const Index: React.FC = () => {
  const { data: banners = [], isLoading } = useBanners();

  // All banners are now considered "approved" as there's no status column
  const displayedBanners = banners;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải banner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Các Banner Nổi Bật
          </h1>
          {displayedBanners.length > 0 ? (
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {displayedBanners.map((banner, index) => (
                  <CarouselItem key={banner.id}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-lg">
                          <LazyImage
                            src={banner.image_url}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                            placeholderClassName="w-full h-full bg-gray-200"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Chưa có banner nào</h3>
              <p className="mb-4">Vui lòng tải lên các banner mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;