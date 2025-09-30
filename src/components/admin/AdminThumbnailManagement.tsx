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
import { Plus, Image, Clock, CheckCircle, XCircle, Edit, Trash2, ExternalLink, Heart, Search, Folder, Tag } from "lucide-react";
import { useThumbnails, useDeleteThumbnail, useThumbnailCategories, useThumbnailTypes } from "@/hooks/useThumbnails"; // Import useThumbnailCategories and useThumbnailTypes
import { useDebounce } from "@/hooks/useDebounce";
import { Thumbnail } from "@/hooks/useThumbnails";
import AddThumbnailDialog from "@/components/AddThumbnailDialog";
import BulkUploadDialog from "@/components/BulkUploadDialog";
import EditThumbnailDialog from "@/components/EditThumbnailDialog";
import ApprovalDialog from "@/components/thumbnail/ApprovalDialog";
import LazyImage from "@/components/LazyImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThumbnailCategoryManagement from "./ThumbnailCategoryManagement";
import ThumbnailTypeManagement from "./ThumbnailTypeManagement";

const AdminThumbnailManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // New state for category filter
  const [selectedType, setSelectedType] = useState("all"); // New state for type filter
  const [currentPage, setCurrentPage] = useState(1);
  const [editingThumbnail, setEditingThumbnail] = useState<Thumbnail | null>(null);
  const [approvingThumbnail, setApprovingThumbnail] = useState<Thumbnail | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const pageSize = 20;

  // Fetch categories and thumbnail types for filters
  const { data: categories = [] } = useThumbnailCategories();
  const { data: thumbnailTypes = [] } = useThumbnailTypes();

  // Provide default parameters for useThumbnails
  const { data: thumbnailsData, isLoading } = useThumbnails({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearchTerm,
    selectedCategory: selectedCategory,
    selectedType: selectedType, // Pass selectedType here
    sortBy: "created_desc"
  });

  const thumbnails = thumbnailsData?.thumbnails || [];
  const totalCount = thumbnailsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const deleteThumbnailMutation = useDeleteThumbnail();

  // Handler functions
  const handleEdit = useCallback((thumbnail: Thumbnail) => {
    setEditingThumbnail(thumbnail);
  }, []);

  const handleApprove = useCallback((thumbnail: Thumbnail) => {
    setApprovingThumbnail(thumbnail);
  }, []);

  const handleDelete = useCallback((thumbnailId: string) => {
    deleteThumbnailMutation.mutate(thumbnailId);
  }, [deleteThumbnailMutation]);

  const handleCanvaOpen = useCallback((canvaLink: string | null) => {
    if (canvaLink) {
      window.open(canvaLink, "_blank");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Thumbnail</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và duyệt các thumbnail được tải lên hệ thống
        </p>
      </div>

      <Tabs defaultValue="thumbnails" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thumbnails" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Thumbnails
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Loại Thumbnail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumbnails" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc và Tìm kiếm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm thumbnail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <AddThumbnailDialog />
                <BulkUploadDialog />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Chọn ngành hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Chọn loại thumbnail" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại thumbnail</SelectItem>
                    {thumbnailTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail Management Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Thumbnail ({totalCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách thumbnail...
                </div>
              ) : thumbnails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {debouncedSearchTerm
                    ? "Không tìm thấy thumbnail phù hợp với bộ lọc."
                    : "Chưa có thumbnail nào trong hệ thống."}
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
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {thumbnails.map((thumbnail) => (
                          <ThumbnailTableRow
                            key={thumbnail.id}
                            thumbnail={thumbnail}
                            onEdit={handleEdit}
                            onApprove={handleApprove}
                            onDelete={handleDelete}
                            onCanvaOpen={handleCanvaOpen}
                            isDeleting={deleteThumbnailMutation.isPending}
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <ThumbnailCategoryManagement />
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <ThumbnailTypeManagement />
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      {editingThumbnail && (
        <EditThumbnailDialog
          thumbnail={editingThumbnail}
          open={!!editingThumbnail}
          onOpenChange={(open) => !open && setEditingThumbnail(null)}
        />
      )}
      
      {/* Approval Dialog */}
      {approvingThumbnail && (
        <ApprovalDialog
          thumbnail={approvingThumbnail}
          open={!!approvingThumbnail}
          onOpenChange={(open) => !open && setApprovingThumbnail(null)}
        />
      )}
    </div>
  );
};

// Thumbnail Table Row Component
interface ThumbnailTableRowProps {
  thumbnail: Thumbnail;
  onEdit: (thumbnail: Thumbnail) => void;
  onApprove: (thumbnail: Thumbnail) => void;
  onDelete: (thumbnailId: string) => void;
  onCanvaOpen: (canvaLink: string | null) => void;
  isDeleting: boolean;
}

const ThumbnailTableRow: React.FC<ThumbnailTableRowProps> = ({
  thumbnail,
  onEdit,
  onApprove,
  onDelete,
  onCanvaOpen,
  isDeleting
}) => {
  
  // Removed getStatusBadge as status column is removed
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
            src={thumbnail.image_url}
            alt={thumbnail.name}
            className="w-full h-full object-contain bg-muted"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="max-w-48">
          <p className="truncate" title={thumbnail.name}>{thumbnail.name}</p>
        </div>
      </TableCell>
      <TableCell>{thumbnail.thumbnail_categories?.name || "N/A"}</TableCell>
      <TableCell>{thumbnail.thumbnail_types?.name || "N/A"}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-1 justify-end">
          {thumbnail.canva_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCanvaOpen(thumbnail.canva_link)}
              title="Mở Canva"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          
          {thumbnail.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApprove(thumbnail)}
              className="text-green-600 hover:text-green-700"
              title="Duyệt thumbnail"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(thumbnail)}
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
                title="Xóa thumbnail"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa thumbnail</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa thumbnail "{thumbnail.name}"?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(thumbnail.id)}
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

export default AdminThumbnailManagement;