
import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBanners, useCategories, useBannerTypes } from '@/hooks/useBanners';

const BannerGallery = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 5-6 banners per row, 3-4 rows = ~20 banners per page

  const { data: banners = [], isLoading: bannersLoading } = useBanners();
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Filter banners based on search and filters
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || banner.categories.id === selectedCategory;
    const matchesType = selectedType === 'all' || banner.banner_types.id === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Banner Gallery
          </h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Xin chào, {user.email}</span>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Nhập tên banner để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tất cả ngành hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {bannerTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Banner Mới
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBanners.length)} trong tổng số {filteredBanners.length} banner
            {totalPages > 1 && <span className="float-right">Trang {currentPage} / {totalPages}</span>}
          </p>
        </div>

        {/* Loading State */}
        {bannersLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải banner...</p>
          </div>
        )}

        {/* Empty State */}
        {!bannersLoading && currentBanners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {filteredBanners.length === 0 && banners.length === 0 
                ? "Chưa có banner nào. Hãy thêm banner đầu tiên!" 
                : "Không tìm thấy banner phù hợp với bộ lọc."}
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Banner Mới
            </Button>
          </div>
        )}

        {/* Banner Grid - 5-6 banners per row */}
        {!bannersLoading && currentBanners.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {currentBanners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[4/3] relative">
                  <img 
                    src={banner.image_url} 
                    alt={banner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900 text-sm truncate" title={banner.name}>
                      {banner.name}
                    </h3>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Ngành:</span>
                      <span className="truncate ml-1">{banner.categories.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại:</span>
                      <span className="truncate ml-1">{banner.banner_types.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-8"
                      size="sm"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Sửa
                    </Button>
                    {banner.canva_link && (
                      <Button 
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 h-8"
                        size="sm"
                        onClick={() => window.open(banner.canva_link!, '_blank')}
                      >
                        Canva
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default BannerGallery;
