
import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBanners, useBannerTypes, useCategories, type Banner } from '@/hooks/useBanners';
import AppHeader from '@/components/AppHeader';

const BannerGallery = () => {
  const { data: banners = [], isLoading, error } = useBanners();
  const { data: bannerTypes = [] } = useBannerTypes();
  const { data: categories = [] } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination settings: 3 rows x 6 banners = 18 banners per page
  const bannersPerPage = 18;

  const filteredBanners = useMemo(() => {
    return banners.filter((banner: Banner) => {
      const matchesSearch = banner.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || banner.banner_types?.id === selectedType;
      const matchesCategory = selectedCategory === 'all' || banner.categories?.id === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [banners, searchTerm, selectedType, selectedCategory]);

  const totalPages = Math.ceil(filteredBanners.length / bannersPerPage);
  const currentBanners = filteredBanners.slice(
    (currentPage - 1) * bannersPerPage,
    currentPage * bannersPerPage
  );

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    target.src = '/placeholder.svg';
  };

  const handleDownload = async (banner: Banner) => {
    try {
      const response = await fetch(banner.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${banner.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải banner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Lỗi khi tải banner: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thư viện Banner</h1>
          <p className="text-gray-600">Khám phá và tải xuống các banner chất lượng cao</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm banner..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(value) => {
              setSelectedType(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loại banner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {bannerTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Hiển thị {currentBanners.length} trên tổng số {filteredBanners.length} banner
          </p>
          {totalPages > 1 && (
            <p className="text-gray-600">
              Trang {currentPage} / {totalPages}
            </p>
          )}
        </div>

        {/* Banner Grid - 6 columns, 3 rows per page */}
        {currentBanners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            {currentBanners.map((banner) => (
              <Card key={banner.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={banner.image_url}
                      alt={banner.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(banner.image_url, '_blank')}
                          className="bg-white text-gray-800 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(banner)}
                          className="bg-white text-gray-800 hover:bg-gray-100"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {banner.canva_link && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(banner.canva_link!, '_blank')}
                            className="bg-white text-gray-800 hover:bg-gray-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {banner.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {banner.banner_types?.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {banner.categories?.name}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy banner</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerGallery;
