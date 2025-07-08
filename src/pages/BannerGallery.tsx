import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBanners, useDeleteBanner } from '@/hooks/useBanners';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePagination, DOTS } from '@/hooks/usePagination';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import AddBannerDialog from '@/components/AddBannerDialog';
import BulkUploadDialog from '@/components/BulkUploadDialog';
import EditBannerDialog from '@/components/EditBannerDialog';
import BannerFilters from '@/components/banner/BannerFilters';
import BannerCard from '@/components/banner/BannerCard';
import ApprovalDialog from '@/components/banner/ApprovalDialog';
import ImagePreviewDialog from '@/components/banner/ImagePreviewDialog';

const BannerGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States for input and actual search term
  const [inputSearchTerm, setInputSearchTerm] = useState(() => localStorage.getItem('bannerSearchTerm') || '');
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('bannerSearchTerm') || '');
  
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('bannerCategoryFilter') || 'all');
  const [selectedType, setSelectedType] = useState(() => localStorage.getItem('bannerTypeFilter') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(() => localStorage.getItem('bannerStatusFilter') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState(null);
  const [approvingBanner, setApprovingBanner] = useState(null);
  const [previewingBanner, setPreviewingBanner] = useState(null);
  const itemsPerPage = 18;

  // Use the optimized useBanners hook
  const { data: bannersData, isLoading: bannersLoading } = useBanners({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
    selectedCategory,
    selectedType,
    selectedStatus,
  });

  const banners = bannersData?.banners || [];
  const totalCount = bannersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const { data: userProfile } = useUserProfile();
  const deleteBannerMutation = useDeleteBanner();

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Effect to save filters to localStorage
  useEffect(() => {
    localStorage.setItem('bannerSearchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('bannerCategoryFilter', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('bannerTypeFilter', selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem('bannerStatusFilter', selectedStatus);
  }, [selectedStatus]);

  // Reset to first page when filters change
  useEffect(() => {
    console.log('Filter changed, resetting to page 1');
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, selectedStatus]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleEditBanner = (banner: any) => {
    if (isAdmin) {
      setEditingBanner(banner);
    }
  };

  const handleApproveBanner = (banner: any) => {
    if (isAdmin) {
      setApprovingBanner(banner);
    }
  };

  const handleCanvaOpen = (canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, '_blank');
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    deleteBannerMutation.mutate(bannerId);
  };

  const handleSearchSubmit = () => {
    console.log('Search submitted:', inputSearchTerm);
    setSearchTerm(inputSearchTerm);
  };

  // Handle category filter change immediately
  const handleCategoryChange = (category: string) => {
    console.log('Category filter changed:', category);
    setSelectedCategory(category);
  };

  // Handle type filter change immediately  
  const handleTypeChange = (type: string) => {
    console.log('Type filter changed:', type);
    setSelectedType(type);
  };

  // Handle status filter change immediately
  const handleStatusChange = (status: string) => {
    console.log('Status filter changed:', status);
    setSelectedStatus(status);
  };

  const handlePreviewBanner = (banner: any) => {
    setPreviewingBanner(banner);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border">
          <BannerFilters
            inputSearchTerm={inputSearchTerm}
            setInputSearchTerm={setInputSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            selectedType={selectedType}
            setSelectedType={handleTypeChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleStatusChange}
            onSearchSubmit={handleSearchSubmit}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <AddBannerDialog />
              {isAdmin && <BulkUploadDialog />}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            Hiển thị {banners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
            {Math.min(currentPage * itemsPerPage, totalCount)} trong tổng số {totalCount} thumbnail
            {totalPages > 1 && <span className="block sm:float-right mt-1 sm:mt-0">Trang {currentPage} / {totalPages}</span>}
          </p>
        </div>

        {bannersLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tải thumbnail...</p>
          </div>
        )}

        {!bannersLoading && banners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {totalCount === 0 
                ? "Chưa có thumbnail nào." 
                : "Không tìm thấy thumbnail phù hợp với bộ lọc."}
            </p>
            {totalCount === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <AddBannerDialog />
                {isAdmin && <BulkUploadDialog />}
              </div>
            )}
          </div>
        )}

        {!bannersLoading && banners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 mb-8">
            {banners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                isAdmin={isAdmin}
                onEdit={handleEditBanner}
                onDelete={handleDeleteBanner}
                onCanvaOpen={handleCanvaOpen}
                onApprove={handleApproveBanner}
                onPreview={handlePreviewBanner}
                isDeleting={deleteBannerMutation.isPending}
              />
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

      {isAdmin && approvingBanner && (
        <ApprovalDialog
          banner={approvingBanner}
          open={!!approvingBanner}
          onOpenChange={(open) => !open && setApprovingBanner(null)}
        />
      )}

      <ImagePreviewDialog
        banner={previewingBanner}
        open={!!previewingBanner}
        onOpenChange={(open) => !open && setPreviewingBanner(null)}
        onCanvaOpen={handleCanvaOpen}
      />
    </div>
  );
};

export default BannerGallery;
