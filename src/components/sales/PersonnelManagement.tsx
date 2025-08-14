
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
  Personnel, 
  useCreatePersonnel, 
  useUpdatePersonnel, 
  useDeletePersonnel 
} from "@/hooks/usePersonnel";
import { Leader } from "@/hooks/useLeaders";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PersonnelManagementProps {
  personnel: Personnel[];
  leaders: Leader[];
  isLoading: boolean;
}

const PersonnelManagement = ({ personnel, leaders, isLoading }: PersonnelManagementProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [personnelName, setPersonnelName] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");

  const createPersonnel = useCreatePersonnel();
  const updatePersonnel = useUpdatePersonnel();
  const deletePersonnel = useDeletePersonnel();

  const handleCreate = async () => {
    if (!personnelName.trim()) {
      toast.error("Vui lòng nhập tên nhân sự");
      return;
    }
    
    await createPersonnel.mutateAsync({
      name: personnelName.trim(),
      leader_id: selectedLeaderId || null
    });
    setPersonnelName("");
    setSelectedLeaderId("");
    setShowCreateDialog(false);
  };

  const handleEdit = async () => {
    if (!selectedPersonnel || !personnelName.trim()) {
      toast.error("Vui lòng nhập tên nhân sự");
      return;
    }
    
    await updatePersonnel.mutateAsync({
      id: selectedPersonnel.id,
      name: personnelName.trim(),
      leader_id: selectedLeaderId || null
    });
    setPersonnelName("");
    setSelectedLeaderId("");
    setSelectedPersonnel(null);
    setShowEditDialog(false);
  };

  const handleDelete = async (person: Personnel) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${person.name}"?`)) {
      await deletePersonnel.mutateAsync(person.id);
    }
  };

  const openEditDialog = (person: Personnel) => {
    setSelectedPersonnel(person);
    setPersonnelName(person.name);
    setSelectedLeaderId(person.leader_id || "");
    setShowEditDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý Nhân sự</CardTitle>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm Nhân sự
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Nhân sự mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personnel-name">Tên Nhân sự</Label>
                <Input
                  id="personnel-name"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="Nhập tên nhân sự..."
                />
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
                  disabled={createPersonnel.isPending}
                >
                  {createPersonnel.isPending ? "Đang thêm..." : "Thêm"}
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
                <TableHead>Tên Nhân sự</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Chưa có nhân sự nào
                  </TableCell>
                </TableRow>
              ) : (
                personnel.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.leaders?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(person.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(person)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person)}
                        disabled={deletePersonnel.isPending}
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
              <DialogTitle>Sửa Nhân sự</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-personnel-name">Tên Nhân sự</Label>
                <Input
                  id="edit-personnel-name"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="Nhập tên nhân sự..."
                />
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
                  disabled={updatePersonnel.isPending}
                >
                  {updatePersonnel.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PersonnelManagement;
