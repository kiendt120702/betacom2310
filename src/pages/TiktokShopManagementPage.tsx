import React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Store, Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { toast } from "sonner";

interface TiktokShop {
  id: string;
  name: string;
  description: string | null;
  status: string;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

/**
 * TikTok Shop Management Page Component
 * Manages TikTok shops with CRUD operations
 */
const TiktokShopManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<TiktokShop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Đang Vận Hành",
    profile_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useUserProfile();
  const { isAdmin } = useUserPermissions(currentUser || undefined);

  // Fetch TikTok shops
  const { data: shops = [], isLoading, refetch } = useQuery({
    queryKey: ['tiktok-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_shops')
        .select(`
          *,
          profile:profiles (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching TikTok shops:', error);
        throw error;
      }

      return data as TiktokShop[];
    },
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data;
    },
  });

  // Filter shops based on search and status
  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (shop.description && shop.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus === "all" || shop.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, selectedStatus]);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Đang Vận Hành", label: "Đang Vận Hành" },
    { value: "Shop mới", label: "Shop mới" },
    { value: "Đã Dừng", label: "Đã Dừng" }
  ];

  const handleCreateShop = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('tiktok_shops')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          profile_id: formData.profile_id || null
        });

      if (error) {
        console.error('Error creating shop:', error);
        toast.error("Có lỗi xảy ra khi tạo shop!");
        return;
      }

      toast.success("Tạo shop thành công!");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", status: "Đang Vận Hành", profile_id: "" });
      refetch();
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error("Có lỗi xảy ra khi tạo shop!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditShop = async () => {
    if (!selectedShop || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('tiktok_shops')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          profile_id: formData.profile_id || null
        })
        .eq('id', selectedShop.id);

      if (error) {
        console.error('Error updating shop:', error);
        toast.error("Có lỗi xảy ra khi cập nhật shop!");
        return;
      }

      toast.success("Cập nhật shop thành công!");
      setIsEditDialogOpen(false);
      setSelectedShop(null);
      setFormData({ name: "", description: "", status: "Đang Vận Hành", profile_id: "" });
      refetch();
    } catch (error) {
      console.error('Error updating shop:', error);
      toast.error("Có lỗi xảy ra khi cập nhật shop!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async (shop: TiktokShop) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa shop "${shop.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tiktok_shops')
        .delete()
        .eq('id', shop.id);

      if (error) {
        console.error('Error deleting shop:', error);
        toast.error("Có lỗi xảy ra khi xóa shop!");
        return;
      }

      toast.success("Xóa shop thành công!");
      refetch();
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error("Có lỗi xảy ra khi xóa shop!");
    }
  };

  const openEditDialog = (shop: TiktokShop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description || "",
      status: shop.status,
      profile_id: shop.profile_id || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Đang Vận Hành":
        return "default";
      case "Shop mới":
        return "secondary";
      case "Đã Dừng":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Shop TikTok</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý danh sách các shop TikTok và phân công nhân sự
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Shop TikTok Mới</DialogTitle>
              <DialogDescription>
                Tạo shop TikTok mới và phân công nhân sự phụ trách
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Shop *</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên shop"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  placeholder="Nhập mô tả shop"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang Vận Hành">Đang Vận Hành</SelectItem>
                    <SelectItem value="Shop mới">Shop mới</SelectItem>
                    <SelectItem value="Đã Dừng">Đã Dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_id">Nhân sự phụ trách</Label>
                <Select value={formData.profile_id} onValueChange={(value) => setFormData({ ...formData, profile_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân sự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không phân công</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateShop} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo Shop"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm và Lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Tìm theo tên shop hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Danh Sách Shop ({filteredShops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy shop nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Shop</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Nhân sự phụ trách</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShops.map(shop => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(shop.status)}>
                        {shop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shop.profile ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {shop.profile.full_name || shop.profile.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Chưa phân công</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(shop.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(shop)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteShop(shop)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Shop TikTok</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin shop và phân công nhân sự
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên Shop *</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên shop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Input
                id="edit-description"
                placeholder="Nhập mô tả shop"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đang Vận Hành">Đang Vận Hành</SelectItem>
                  <SelectItem value="Shop mới">Shop mới</SelectItem>
                  <SelectItem value="Đã Dừng">Đã Dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-profile_id">Nhân sự phụ trách</Label>
              <Select value={formData.profile_id} onValueChange={(value) => setFormData({ ...formData, profile_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân sự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không phân công</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditShop} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập Nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiktokShopManagementPage;