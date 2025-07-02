import React, { useState, useEffect } from 'react';
import { Search, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBanners, useCategories, useBannerTypes } from '@/hooks/useBanners';
import { useUserProfile } from '@/hooks/useUserProfile';
import AddBannerDialog from '@/components/AddBannerDialog';
import BulkUploadDialog from '@/components/BulkUploadDialog';
import EditBannerDialog from '@/components/EditBannerDialog';
import AppHeader from '@/components/AppHeader';
import { usePagination, DOTS } from '@/hooks/usePagination';

const BannerGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState(null);
  const itemsPerPage = 18;

  const { data: banners = [], isLoading: bannersLoading } = useBanners();
  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();
  const { data: userProfile } = useUserProfile();

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fixed filter logic
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || banner.categories?.id === selectedCategory;
    const matchesType = selectedType === 'all' || banner.banner_types?.id === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredBanners.length,
    pageSize: itemsPerPage,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType]);

  const handleEditBanner = (banner) => {
    if (isAdmin) {
      setEditingBanner(banner);
    }
  };

  const handleCanvaOpen = (canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, '_blank');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Nhập tên banner để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
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
                <SelectTrigger className="w-full sm:w-48">
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
          </div>
          
          {isAdmin && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <AddBannerDialog />
                <BulkUploadDialog />
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBanners.length)} trong tổng số {filteredBanners.length} banner
            {totalPages > 1 && <span className="block sm:float-right mt-1 sm:mt-0">Trang {currentPage} / {totalPages}</span>}
          </p>
        </div>

        {bannersLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải banner...</p>
          </div>
        )}

        {!bannersLoading && currentBanners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {filteredBanners.length === 0 && banners.length === 0 
                ? "Chưa có banner nào." 
                : "Không tìm thấy banner phù hợp với bộ lọc."}
            </p>
            {isAdmin && filteredBanners.length === 0 && banners.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <AddBannerDialog />
                <BulkUploadDialog />
              </div>
            )}
          </div>
        )}

        {!bannersLoading && currentBanners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-8">
            {currentBanners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={banner.image_url} 
                    alt={banner.name}
                    className="w-full h-full object-cover bg-gray-50 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
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
                      <span className="truncate ml-1">{banner.categories?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại:</span>
                      <span className="truncate ml-1">{banner.banner_types?.name || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {banner.canva_link && (
                      <Button 
                        className="w-full bg-canva-button hover:bg-canva-button/90 text-canva-button-foreground text-xs py-1 h-8"
                        size="sm"
                        onClick={() => handleCanvaOpen(banner.canva_link)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Canva
                      </Button>
                    )}
                    
                    {isAdmin && (
                      <Button 
                        className="w-full bg-edit-button hover:bg-edit-button/90 text-edit-button-foreground text-xs py-1 h-8"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {paginationRange?.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                  return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                }
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
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

      {isAdmin && editingBanner && (
        <EditBannerDialog
          banner={editingBanner}
          open={!!editingBanner}
          onOpenChange={(open) => !open && setEditingBanner(null)}
        />
      )}
    </div>
  );
};

export default BannerGallery;