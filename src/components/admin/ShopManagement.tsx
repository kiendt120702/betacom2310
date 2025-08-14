import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useShops, useDeleteShop, Shop } from "@/hooks/useShops";
import ShopDialog from "./ShopDialog";

const ShopManagement = () => {
  const { data: shops = [], isLoading } = useShops();
  const deleteShop = useDeleteShop();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const handleAdd = () => {
    setEditingShop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa shop này?")) {
      deleteShop.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Shop
          </CardTitle>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Shop
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Đang tải danh sách shop...</p> : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.profiles?.full_name || "N/A"}</TableCell>
                      <TableCell>{shop.leader_profile?.full_name || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shop)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(shop.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <ShopDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} shop={editingShop} />
    </>
  );
};

export default ShopManagement;