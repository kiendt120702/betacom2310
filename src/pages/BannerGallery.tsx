import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Search, Image as ImageIcon, Loader2, Eye, EyeOff, Edit, ExternalLink, Trash2 } from 'lucide-react';
import { useBanners, useDeleteBanner, useBannerTypes, useCategories, useUpdateBanner } from '@/hooks/useBanners';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import AddBannerDialog from '@/components/AddBannerDialog';
import BulkUploadDialog from '@/components/BulkUploadDialog';
import EditBannerDialog from '@/components/EditBannerDialog';
import { Badge } from '@/components/ui/badge';
import { cn, removeDiacritics } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LazyImage from '@/components/LazyImage';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { usePagination, DOTS } from '@/hooks/usePagination';

const BannerGallery: React.FC = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();
  const { data: allBannerTypes = [], isLoading: bannerTypesLoading } = useBannerTypes();
  const deleteBannerMutation = useDeleteBanner();
  const updateBannerMutation = useUpdateBanner();
  const { toast } = useToast();

  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showOnlyMyBanners, setShowOnlyMyBanners] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // State for dialogs
  const [isAddBannerDialogOpen, setIsAddBannerDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isEditBannerDialogOpen, setIsEditBannerDialogOpen] = useState(false);


  const { data: banners = [], isLoading: bannersLoading, refetch } = useBanners({
    page: currentPage,
    pageSize: itemsPerPage,
    searchTerm: searchTerm,
    selectedCategory: selectedCategory,
    selectedType: selectedType,
  });

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

  const totalCount = banners.length; // Since filtering is done client-side in useBanners hook now
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalCount,
    pageSize: itemsPerPage,
  });

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(inputSearchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleToggleMyBanners = () => {
    setShowOnlyMyBanners(prev => !prev);
    setCurrentPage(1);
  };

  const handleToggleActive = async (bannerId: string, currentActiveStatus: boolean) => {
    try {
      await updateBannerMutation.mutateAsync({
        id: bannerId,
        active: !currentActiveStatus,
      });
      toast({
        title: "Thành công",
        description: `Banner đã được ${!currentActiveStatus ? 'kích hoạt' : 'vô hiệu hóa'}.`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái banner.",
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = (banner: any) => {
    if (isAdmin) { // Only admin can edit
      setEditingBanner(banner);
      setIsEditBannerDialogOpen(true);
    } else {
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền chỉnh sửa banner.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!isAdmin) { // Only admin can delete
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền xóa banner.",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteBannerMutation.mutateAsync(bannerId);
      toast({ title: "Thành công", description: "Banner đã được xóa." });
      refetch();
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xóa banner.", variant: "destructive" });
    }
  };

  const [editingBanner, setEditingBanner] = useState(null);

  const handleBannerAdded = () => {
    setIsAddBannerDialogOpen(false);
    refetch();
  };

  const handleBulkUploadSuccess = () => {
    setIsBulkUploadDialogOpen(false);
    refetch();
  };

  const handleBannerUpdated = () => {
    setIsEditBannerDialogOpen(false);
    setEditingBanner(null);
    refetch();
  };

  if (profileLoading || bannersLoading || categoriesLoading || bannerTypesLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-primary" />
                Quản lý Thumbnail
              </CardTitle>
              <CardDescription className="mt-1">
                Quản lý các thumbnail được tải lên bởi người dùng.
              </CardDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <AddBannerDialog onBannerAdded={handleBannerAdded} />
                <BulkUploadDialog onBulkUploadSuccess={handleBulkUploadSuccess} />
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, loại, ngành hàng, hoặc người tạo (nhấn Enter)..."
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tất cả ngành hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {allBannerTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(isLeader || isChuyenVien) && ( // Only show "My Banners" filter for Leader and ChuyenVien
              <Button
                variant="outline"
                onClick={handleToggleMyBanners}
                className={cn(
                  "w-full md:w-auto",
                  showOnlyMyBanners ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {showOnlyMyBanners ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                Chỉ xem của tôi
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy banner nào</h3>
              <p className="mb-4">Thử thay đổi bộ lọc hoặc thêm banner mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {banners.map(banner => (
                <Card key={banner.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
                    <LazyImage
                      src={banner.image_url}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                      placeholderClassName="w-full h-full"
                    />
                    {isAdmin && (
                      <div className="absolute top-2 right-2">
                        <Label htmlFor={`active-switch-${banner.id}`} className="sr-only">Kích hoạt</Label>
                        <Switch
                          id={`active-switch-${banner.id}`}
                          checked={banner.active}
                          onCheckedChange={() => handleToggleActive(banner.id, banner.active)}
                          disabled={updateBannerMutation.isPending}
                        />
                      </div>
                    )}
                    <Badge
                      className={cn(
                        "absolute bottom-2 left-2 px-2 py-1 text-xs font-medium",
                        banner.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                      )}
                    >
                      {banner.active ? "Đang hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium text-gray-800 truncate mb-1" title={banner.name}>
                      {banner.name}
                    </p>
                    <p className="text-gray-600 truncate mb-1" title={banner.banner_types?.name || 'Không rõ loại'}>
                      Loại: {banner.banner_types?.name || 'Không rõ'}
                    </p>
                    <p className="text-gray-600 truncate mb-1" title={banner.categories?.name || 'Không rõ ngành hàng'}>
                      Ngành: {banner.categories?.name || 'Không rõ'}
                    </p>
                    <p className="text-gray-600 truncate mb-1" title={banner.users?.full_name || banner.users?.email || 'Người dùng ẩn danh'}>
                      Tạo bởi: {banner.users?.full_name || banner.users?.email || 'Ẩn danh'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Ngày tạo: {new Date(banner.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      {banner.canva_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(banner.canva_link, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEditBanner(banner)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa banner "{banner.name}"? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBanner(banner.id)}
                                  disabled={deleteBannerMutation.isPending}
                                >
                                  {deleteBannerMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
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
            </div>
          )}
        </CardContent>
      </Card>

      {editingBanner && (
        <EditBannerDialog
          open={isEditBannerDialogOpen}
          onOpenChange={setIsEditBannerDialogOpen}
          banner={editingBanner}
          onBannerUpdated={handleBannerUpdated}
        />
      )}
    </div>
  );
};

export default BannerGallery;