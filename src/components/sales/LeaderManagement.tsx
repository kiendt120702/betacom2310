
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
  Leader, 
  useCreateLeader, 
  useUpdateLeader, 
  useDeleteLeader 
} from "@/hooks/useLeaders";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface LeaderManagementProps {
  leaders: Leader[];
  isLoading: boolean;
}

const LeaderManagement = ({ leaders, isLoading }: LeaderManagementProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [leaderName, setLeaderName] = useState("");

  const createLeader = useCreateLeader();
  const updateLeader = useUpdateLeader();
  const deleteLeader = useDeleteLeader();

  const handleCreate = async () => {
    if (!leaderName.trim()) {
      toast.error("Vui lòng nhập tên leader");
      return;
    }
    
    await createLeader.mutateAsync(leaderName.trim());
    setLeaderName("");
    setShowCreateDialog(false);
  };

  const handleEdit = async () => {
    if (!selectedLeader || !leaderName.trim()) {
      toast.error("Vui lòng nhập tên leader");
      return;
    }
    
    await updateLeader.mutateAsync({
      id: selectedLeader.id,
      name: leaderName.trim()
    });
    setLeaderName("");
    setSelectedLeader(null);
    setShowEditDialog(false);
  };

  const handleDelete = async (leader: Leader) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa leader "${leader.name}"?`)) {
      await deleteLeader.mutateAsync(leader.id);
    }
  };

  const openEditDialog = (leader: Leader) => {
    setSelectedLeader(leader);
    setLeaderName(leader.name);
    setShowEditDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý Leader</CardTitle>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm Leader
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Leader mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leader-name">Tên Leader</Label>
                <Input
                  id="leader-name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Nhập tên leader..."
                />
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
                  disabled={createLeader.isPending}
                >
                  {createLeader.isPending ? "Đang thêm..." : "Thêm"}
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
                <TableHead>Tên Leader</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Chưa có leader nào
                  </TableCell>
                </TableRow>
              ) : (
                leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>
                      {new Date(leader.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(leader)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(leader)}
                        disabled={deleteLeader.isPending}
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
              <DialogTitle>Sửa Leader</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-leader-name">Tên Leader</Label>
                <Input
                  id="edit-leader-name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Nhập tên leader..."
                />
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
                  disabled={updateLeader.isPending}
                >
                  {updateLeader.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LeaderManagement;
