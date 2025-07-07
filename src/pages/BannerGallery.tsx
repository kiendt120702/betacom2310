import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit, ExternalLink, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBanners, useCategories, useBannerTypes, useDeleteBanner, useUpdateBannerStatus } from '@/hooks/useBanners';
import { useUserProfile } from '@/hooks/useUserProfile';
import AddBannerDialog from '@/components/AddBannerDialog';
import BulkUploadDialog from '@/components/BulkUploadDialog';
import EditBannerDialog from '@/components/EditBannerDialog';
import AppHeader from '@/components/AppHeader';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { cn, removeDiacritics } from '@/lib/utils';
import LazyImage from '@/components/LazyImage';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';

type BannerStatus = Database['public']['Enums']['banner_status'];

const BannerGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inputSearchTerm, setInputSearchTerm] = useState(() => localStorage.getItem('bannerSearchTerm') || '');
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('bannerSearchTerm') || '');
  
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('bannerCategoryFilter') || 'all');
  const [selectedType, setSelectedType] = useState(() => localStorage.getItem('bannerTypeFilter') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(() => localStorage.getItem('bannerStatusFilter') || 'all'); // New state for status filter
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState(null);
  const itemsPerPage = 18;

  const { data: bannersData, isLoading: bannersLoading } = useBanners({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
    selectedCategory,
    selectedType,
    selectedStatus: selectedStatus === 'all' ? undefined : selectedStatus as BannerStatus, // Pass status filter
  });

  const rawBanners = bannersData?.banners || [];

  const normalizedSearchTerm = removeDiacritics(searchTerm).toLowerCase();
  const clientFilteredBanners = useMemo(() => {
    if (!normalizedSearchTerm) {
      return rawBanners;
    }
    return rawBanners.filter(banner =>
      removeDiacritics(banner.name).toLowerCase().includes(normalizedSearchTerm)
    );
  }, [rawBanners, normalizedSearchTerm]);

  const totalCountForDisplay = searchTerm ? clientFilteredBanners.length : (bannersData?.totalCount || 0);
  const totalPages = Math.ceil(totalCountForDisplay / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedAndFilteredBanners = useMemo(() => {
    if (searchTerm) {
      return clientFilteredBanners.slice(startIndex, startIndex + itemsPerPage);
    }
    return rawBanners;
  }, [searchTerm, currentPage, itemsPerPage, clientFilteredBanners, rawBanners, startIndex]);

  const { data: categories = [] } = useCategories();
  const { data: bannerTypes = [] } = useBannerTypes();
  const { data: userProfile } = useUserProfile();

  const deleteBannerMutation = useDeleteBanner();
  const updateBannerStatusMutation = useUpdateBannerStatus(); // New mutation

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Effect to save filters to localStorage
  useEffect(() => {
    localStorage.setItem('bannerSearchTerm', searchTerm);
    localStorage.setItem('bannerCategoryFilter', selectedCategory);
    localStorage.setItem('bannerTypeFilter', selectedType);
    localStorage.setItem('bannerStatusFilter', selectedStatus); // Save status filter
  }, [searchTerm, selectedCategory, selectedType, selectedStatus]);

  // Reset to first page when actual search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, selectedStatus]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCountForDisplay,
    pageSize: itemsPerPage,
  });

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
  };

  const handleCanvaOpen = (canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, '_blank');
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    deleteBannerMutation.mutate(bannerId);
  };

  const handleUpdateStatus = (bannerId: string, status: BannerStatus) => {
    updateBannerStatusMutation.mutate({ id: bannerId, status });
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputSearchTerm);
    }
  };

  const getStatusBadgeColor = (status: BannerStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusDisplayName = (status: BannerStatus) => {
    switch (status) {
      case 'pending': return 'Đang chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không rõ';
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
                placeholder="Nhập tên thumbnail để tìm kiếm (nhấn Enter)..."
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
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
              {isAdmin && ( // Only show status filter for admin
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Đang chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {(isAdmin || isLeader || isChuyenVien) && (
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
            Hiển thị {startIndex + 1}-{startIndex + paginatedAndFilteredBanners.length} trong tổng số {totalCountForDisplay} thumbnail
            {totalPages > 1 && <span className="block sm:float-right mt-1 sm:mt-0">Trang {currentPage} / {totalPages}</span>}
          </p>
        </div>

        {bannersLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải thumbnail...</p>
          </div>
        )}

        {!bannersLoading && paginatedAndFilteredBanners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {totalCountForDisplay === 0 
                ? "Chưa có thumbnail nào." 
                : "Không tìm thấy thumbnail phù hợp với bộ lọc."}
            </p>
            {(isAdmin || isLeader || isChuyenVien) && totalCountForDisplay === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <AddBannerDialog />
                <BulkUploadDialog />
              </div>
            )}
          </div>
        )}

        {!bannersLoading && paginatedAndFilteredBanners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 mb-8">
            {paginatedAndFilteredBanners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="aspect-square relative overflow-hidden">
                  <LazyImage 
                    src={banner.image_url} 
                    alt={banner.name}
                    className="w-full h-full object-contain bg-gray-50"
                    placeholderClassName="w-full h-full"
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
                    <div className="flex justify-between items-center">
                      <span>Trạng thái:</span>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border", 
                          getStatusBadgeColor(banner.status)
                        )}
                      >
                        {getStatusDisplayName(banner.status)}
                      </Badge>
                    </div>
                    {banner.status === 'approved' && banner.profiles?.full_name && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Duyệt bởi:</span>
                        <span className="truncate ml-1">{banner.profiles.full_name}</span>
                      </div>
                    )}
                    {banner.status === 'pending' && banner.profiles?.full_name && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tạo bởi:</span>
                        <span className="truncate ml-1">{banner.profiles.full_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {banner.canva_link && (
                      <Button 
                        className="w-full bg-chat-general-main hover:bg-chat-general-main/90 text-white text-xs py-1 h-8"
                        size="sm"
                        onClick={() => handleCanvaOpen(banner.canva_link)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Canva
                      </Button>
                    )}
                    
                    {(isAdmin || (banner.user_id === user?.id && banner.status === 'pending')) && (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-8"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                    )}

                    {isAdmin && banner.status === 'pending' && (
                      <>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
                          size="sm"
                          onClick={() => handleUpdateStatus(banner.id, 'approved')}
                          disabled={updateBannerStatusMutation.isPending}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Duyệt
                        </Button>
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 h-8"
                          size="sm"
                          onClick={() => handleUpdateStatus(banner.id, 'rejected')}
                          disabled={updateBannerStatusMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Từ chối
                        </Button>
                      </>
                    )}

                    {(isAdmin || (banner.user_id === user?.id && banner.status === 'pending')) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs py-1 h-8"
                            size="sm"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Xóa
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa thumbnail</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa thumbnail "{banner.name}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={deleteBannerMutation.isPending}
                            >
                              {deleteBannerMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

      {editingBanner && (
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