import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useBanners } from '@/hooks/useBanners'; // Import useBanners hook

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { data: bannersData, isLoading: bannersLoading } = useBanners({
    page: 1, // Default to first page for display
    pageSize: 100, // Fetch enough banners for display
    searchTerm: '',
    selectedCategory: 'all',
    selectedType: 'all',
  }); // Use useBanners hook

  const banners = bannersData?.banners || [];

  // All banners are now considered active since the 'active' column is removed
  const displayBanners = banners;

  // Auto slide functionality
  useEffect(() => {
    if (displayBanners.length === 0) return; // Don't start timer if no banners

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const nextSlide = () => {
    if (displayBanners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = () => {
    if (displayBanners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Slideshow */}
      <div className="relative w-full h-[70vh] overflow-hidden bg-gray-900">
        {bannersLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            Đang tải banner...
          </div>
        ) : displayBanners.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            Chưa có banner nào để hiển thị.
          </div>
        ) : (
          <>
            {displayBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <div 
                  className="w-full h-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4 max-w-4xl">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                        {banner.name}
                      </h2>
                      <p className="text-xl md:text-2xl mb-8 animate-fade-in">
                        Khám phá các ưu đãi và sản phẩm mới nhất của chúng tôi!
                      </p>
                      <Button 
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 animate-scale-in"
                        onClick={() => navigate('/thumbnail')}
                      >
                        Khám phá ngay
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {displayBanners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {displayBanners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {displayBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide 
                        ? 'bg-white scale-125' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Hệ thống quản lý Banner chuyên nghiệp
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quản lý dễ dàng</h3>
              <p className="text-gray-600">Thêm, sửa, xóa banner một cách trực quan và nhanh chóng</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Responsive Design</h3>
              <p className="text-gray-600">Hiển thị hoàn hảo trên mọi thiết bị từ mobile đến desktop</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Phân quyền linh hoạt</h3>
              <p className="text-gray-600">Hệ thống phân quyền chi tiết cho từng loại người dùng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;