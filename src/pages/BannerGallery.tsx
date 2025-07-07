import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Search, Image as ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useBanners, useDeleteBanner, useBannerTypes } from '@/hooks/useBanners';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import AddBannerDialog from '@/components/AddBannerDialog';
import BulkUploadDialog from '@/components/BulkUploadDialog';
import EditBannerDialog from '@/components/EditBannerDialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LazyImage from '@/components/LazyImage';
import { Input } from '@/components/ui/input';

const BannerGallery: React.FC = () => {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: banners = [], isLoading: bannersLoading, refetch } = useBanners();
  const { data: allBannerTypes = [], isLoading: bannerTypesLoading } = useBannerTypes();
  const deleteBannerMutation = useDeleteBanner();
  const { toast } = useToast();

  const [isAddBannerDialogOpen, setIsAddBannerDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isEditBannerDialogOpen, setIsEditBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showOnlyMyBanners, setShowOnlyMyBanners] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';
  const isChuyenVien = userProfile?.role === 'chuyên viên';

  const filteredBanners = useMemo(() => {
    let currentBanners = banners;

    if (searchTerm) {
      currentBanners = currentBanners.filter(banner =>
        banner.image_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.banner_types?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      currentBanners = currentBanners.filter(banner => banner.banner_type_id === filterType);
    }

    if (showOnlyMyBanners && userProfile) {
      currentBanners = currentBanners.filter(banner => banner.user_id === userProfile.id);
    }

    return currentBanners;
  }, [banners, searchTerm, filterType, showOnlyMyBanners, userProfile]);

  const handleBannerAdded = () => {
    setIsAddBannerDialogOpen(false);
    refetch();
  };

  const handleBulkUploadSuccess = () => {
    setIsBulkUploadDialogOpen(false);
    refetch();
  };

  const handleEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setIsEditBannerDialogOpen(true);
  };

  const handleBannerUpdated = () => {
    setIsEditBannerDialogOpen(false);
    setEditingBanner(null);
    refetch();
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBannerMutation.mutateAsync(id);
      toast({ title: "Thành công", description: "Banner đã được xóa." });
      refetch();
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xóa banner.", variant: "destructive" });
    }
  };

  // Removed getStatusBadge as status column is removed

  const canEditOrDelete = (banner: any) => {
    if (isAdmin) return true;
    if (isLeader || isChuyenVien) {
      return banner.user_id === userProfile?.id; // Users can edit/delete their own banners
    }
    return false;
  };

  if (profileLoading || bannersLoading || bannerTypesLoading) {
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
            <div className="flex gap-2">
              <AddBannerDialog onBannerAdded={handleBannerAdded} />
              <BulkUploadDialog onBulkUploadSuccess={handleBulkUploadSuccess} />
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo URL, loại, hoặc người tạo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Removed Status Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo loại banner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {allBannerTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowOnlyMyBanners(!showOnlyMyBanners)}
              className={cn(
                "w-full md:w-auto",
                showOnlyMyBanners ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {showOnlyMyBanners ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Chỉ xem của tôi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBanners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy banner nào</h3>
              <p className="mb-4">Thử thay đổi bộ lọc hoặc thêm banner mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredBanners.map(banner => (
                <Card key={banner.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
                    <LazyImage
                      src={banner.image_url}
                      alt={`Banner ${banner.id}`}
                      className="w-full h-full object-cover"
                      placeholderClassName="w-full h-full"
                    />
                    {/* Removed Status Badge */}
                  </div>
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium text-gray-800 truncate mb-1" title={banner.banner_types?.name || 'Không rõ loại'}>
                      Loại: {banner.banner_types?.name || 'Không rõ'}
                    </p>
                    <p className="text-gray-600 truncate mb-1" title={banner.users?.full_name || banner.users?.email || 'Người dùng ẩn danh'}>
                      Tạo bởi: {banner.users?.full_name || banner.users?.email || 'Ẩn danh'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Ngày tạo: {new Date(banner.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    {/* Removed Rejection Reason */}
                    <div className="flex justify-end gap-2 mt-4">
                      {canEditOrDelete(banner) && (
                        <Button variant="outline" size="sm" onClick={() => handleEditBanner(banner)}>
                          Sửa
                        </Button>
                      )}
                      {canEditOrDelete(banner) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {/* Removed Approve/Reject Buttons */}
                    </div>
                  </CardContent>
                </Card>
              ))}
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