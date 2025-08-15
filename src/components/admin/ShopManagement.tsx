import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
import { useShops, useDeleteShop, Shop, useShopAssignableUsers } from "@/hooks/useShops";
import ShopDialog from "./ShopDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

const ShopManagement = () => {
  const { data: shops = [], isLoading } = useShops();
  const deleteShop = useDeleteShop();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // New state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedLeader, setSelectedLeader] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: assignableUsers = [] } = useShopAssignableUsers();
  const users = assignableUsers.filter(user => user.role === "chuyên viên" || user.role === "học việc/thử việc");
  const leaders = assignableUsers.filter(user => user.role === "leader");

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const nameMatch = debouncedSearchTerm ? shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
      const userMatch = selectedUser === "all" ? true : shop.user_id === selectedUser;
      const leaderMatch = selectedLeader === "all" ? true : shop.leader_id === selectedLeader;
      return nameMatch && userMatch && leaderMatch;
    });
  }, [shops, debouncedSearchTerm, selectedUser, selectedLeader]);

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
          {/* Filter section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tên shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo nhân sự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân sự</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLeader} onValueChange={setSelectedLeader}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo leader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả leader</SelectItem>
                {leaders.map(leader => (
                  <SelectItem key={leader.id} value={leader.id}>{leader.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                  {filteredShops.map((shop) => (
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