
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Image, Clock, CheckCircle, XCircle, Edit, Trash2, ExternalLink, Heart, Search } from "lucide-react";
import { useBanners, useDeleteBanner } from "@/hooks/useBanners";
import { useBannerLikes } from "@/hooks/useBannerLikes";
import { useDebounce } from "@/hooks/useDebounce";
import { Banner } from "@/hooks/useBanners";
import AddBannerDialog from "@/components/AddBannerDialog";
import EditBannerDialog from "@/components/EditBannerDialog";
import ApprovalDialog from "@/components/banner/ApprovalDialog";
import LazyImage from "@/components/LazyImage";

const AdminBannerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [approvingBanner, setApprovingBanner] = useState<Banner | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const pageSize = 20;

  // Provide default parameters for useBanners
  const { data: bannersData, isLoading } = useBanners({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearchTerm,
    selectedCategory: "all",
    selectedType: "all",
    selectedStatus,
    sortBy: "created_desc"
  });

  const banners = bannersData?.banners || [];
  const totalCount = bannersData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const deleteBannerMutation = useDeleteBanner();

  // Handler functions
  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner);
  }, []);

  const handleApprove = useCallback((banner: Banner) => {
    setApprovingBanner(banner);
  }, []);

  const handleDelete = useCallback((bannerId: string) => {
    deleteBannerMutation.mutate(bannerId);
  }, [deleteBannerMutation]);

  const handleCanvaOpen = useCallback((canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, "_blank");
    }
  }, []);

  const bannerStats = [
    {
      title: "Tổng Banner",
      value: banners?.length || 0,
      icon: Image,
      color: "text-blue-600",
    },
    {
      title: "Chờ duyệt",
      value: banners?.filter(b => b.status === 'pending').length || 0,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Đã duyệt",
      value: banners?.filter(b => b.status === 'approved').length || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Từ chối",
      value: banners?.filter(b => b.status === 'rejected').length || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Banner</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và duyệt các banner được tải lên hệ thống
          </p>
        </div>
      </div>

      {/* Banner Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {bannerStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm banner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <AddBannerDialog />
          </div>
        </CardContent>
      </Card>

      {/* Banner Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Banner ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải danh sách banner...
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {debouncedSearchTerm || selectedStatus !== "all" 
                ? "Không tìm thấy banner phù hợp với bộ lọc."
                : "Chưa có banner nào trong hệ thống."}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Hình ảnh</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-20 text-center">
                        <Heart className="w-4 h-4 mx-auto" />
                      </TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <BannerTableRow
                        key={banner.id}
                        banner={banner}
                        onEdit={handleEdit}
                        onApprove={handleApprove}
                        onDelete={handleDelete}
                        onCanvaOpen={handleCanvaOpen}
                        isDeleting={deleteBannerMutation.isPending}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      {editingBanner && (
        <EditBannerDialog
          banner={editingBanner}
          open={!!editingBanner}
          onOpenChange={(open) => !open && setEditingBanner(null)}
        />
      )}
      
      {/* Approval Dialog */}
      {approvingBanner && (
        <ApprovalDialog
          banner={approvingBanner}
          open={!!approvingBanner}
          onOpenChange={(open) => !open && setApprovingBanner(null)}
        />
      )}
    </div>
  );
};

// Banner Table Row Component
interface BannerTableRowProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onApprove: (banner: Banner) => void;
  onDelete: (bannerId: string) => void;
  onCanvaOpen: (canvaLink: string | null) => void;
  isDeleting: boolean;
}

const BannerTableRow: React.FC<BannerTableRowProps> = ({
  banner,
  onEdit,
  onApprove,
  onDelete,
  onCanvaOpen,
  isDeleting
}) => {
  const { data: likeData, isLoading: likesLoading } = useBannerLikes(banner.id);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="w-16 h-16 rounded-md overflow-hidden border">
          <LazyImage
            src={banner.image_url}
            alt={banner.name}
            className="w-full h-full object-contain bg-muted"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="max-w-48">
          <p className="truncate" title={banner.name}>{banner.name}</p>
        </div>
      </TableCell>
      <TableCell>{banner.categories?.name || "N/A"}</TableCell>
      <TableCell>{banner.banner_types?.name || "N/A"}</TableCell>
      <TableCell>{getStatusBadge(banner.status)}</TableCell>
      <TableCell className="text-center">
        <span className="font-medium">
          {likesLoading ? "..." : (likeData?.like_count || 0)}
        </span>
      </TableCell>
      <TableCell>{formatDate(banner.created_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2 justify-end">
          {banner.canva_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCanvaOpen(banner.canva_link)}
              title="Mở Canva"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          
          {banner.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApprove(banner)}
              className="text-green-600 hover:text-green-700"
              title="Duyệt banner"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(banner)}
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
                title="Xóa banner"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa banner</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa banner "{banner.name}"?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(banner.id)}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AdminBannerManagement;
