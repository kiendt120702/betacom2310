
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shop, 
  useCreateShop, 
  useUpdateShop, 
  useDeleteShop 
} from "@/hooks/useShops";
import { Personnel } from "@/hooks/usePersonnel";
import { Leader } from "@/hooks/useLeaders";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ShopManagementProps {
  shops: Shop[];
  personnel: Personnel[];
  leaders: Leader[];
  isLoading: boolean;
}

const ShopManagement = ({ shops, personnel, leaders, isLoading }: ShopManagementProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopName, setShopName] = useState("");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>("");
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");

  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();

  const handleCreate = async () => {
    if (!shopName.trim()) {
      toast.error("Vui lòng nhập tên shop");
      return;
    }
    
    await createShop.mutateAsync({
      name: shopName.trim(),
      personnel_id: selectedPersonnelId || null,
      leader_id: selectedLeaderId || null
    });
    setShopName("");
    setSelectedPersonnelId("");
    setSelectedLeaderId("");
    setShowCreateDialog(false);
  };

  const handleEdit = async () => {
    if (!selectedShop || !shopName.trim()) {
      toast.error("Vui lòng nhập tên shop");
      return;
    }
    
    await updateShop.mutateAsync({
      id: selectedShop.id,
      name: shopName.trim(),
      personnel_id: selectedPersonnelId || null,
      leader_id: selectedLeaderId || null
    });
    setShopName("");
    setSelectedPersonnelId("");
    setSelectedLeaderId("");
    setSelectedShop(null);
    setShowEditDialog(false);
  };

  const handleDelete = async (shop: Shop) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa shop "${shop.name}"?`)) {
      await deleteShop.mutateAsync(shop.id);
    }
  };

  const openEditDialog = (shop: Shop) => {
    setSelectedShop(shop);
    setShopName(shop.name);
    setSelectedPersonnelId(shop.personnel_id || "");
    setSelectedLeaderId(shop.leader_id || "");
    setShowEditDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý Shop</CardTitle>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Shop mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Tên Shop</Label>
                <Input
                  id="shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Nhập tên shop..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personnel-select">Nhân sự</Label>
                <Select value={selectedPersonnelId} onValueChange={setSelectedPersonnelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân sự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có nhân sự</SelectItem>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader-select">Leader</Label>
                <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có leader</SelectItem>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createShop.isPending}
                >
                  {createShop.isPending ? "Đang thêm..." : "Thêm"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Shop</TableHead>
                <TableHead>Nhân sự</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Chưa có shop nào
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.personnel?.name || 'N/A'}</TableCell>
                    <TableCell>{shop.leaders?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(shop.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(shop)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(shop)}
                        disabled={deleteShop.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa Shop</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-shop-name">Tên Shop</Label>
                <Input
                  id="edit-shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Nhập tên shop..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-personnel-select">Nhân sự</Label>
                <Select value={selectedPersonnelId} onValueChange={setSelectedPersonnelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân sự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có nhân sự</SelectItem>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-leader-select">Leader</Label>
                <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có leader</SelectItem>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleEdit}
                  disabled={updateShop.isPending}
                >
                  {updateShop.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ShopManagement;
