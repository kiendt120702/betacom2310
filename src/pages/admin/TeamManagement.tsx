import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  Team,
} from "@/hooks/useTeams";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";

const TeamManagement: React.FC = () => {
  const { data: teams = [], isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");

  const handleOpenDialog = (team: Team | null = null) => {
    setEditingTeam(team);
    setTeamName(team ? team.name : "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setTeamName("");
  };

  const handleSubmit = async () => {
    if (!teamName.trim()) return;

    try {
      if (editingTeam) {
        await updateTeam.mutateAsync({ id: editingTeam.id, name: teamName });
      } else {
        await createTeam.mutateAsync(teamName);
      }
      handleCloseDialog();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const isSubmitting = createTeam.isPending || updateTeam.isPending;

  return (
    <StandardManagementLayout
      title="Quản lý Phòng ban"
      icon={Users}
      isLoading={isLoading}
      isEmpty={teams.length === 0}
      actionButton={{
        label: "Thêm Phòng ban",
        onClick: () => handleOpenDialog(),
        icon: Plus,
      }}
      emptyState={{
        icon: Users,
        title: "Chưa có phòng ban nào",
        description: "Tạo phòng ban đầu tiên để bắt đầu quản lý nhóm làm việc.",
        actionButton: {
          label: "Thêm Phòng ban Đầu Tiên",
          onClick: () => handleOpenDialog(),
          icon: Plus,
        },
      }}
    >
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Phòng ban</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(team)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phòng ban "{team.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(team.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? "Sửa Phòng ban" : "Thêm Phòng ban Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingTeam
                ? "Thay đổi tên của phòng ban."
                : "Tạo phòng ban mới để phân loại nhóm làm việc."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nhập tên phòng ban..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardManagementLayout>
  );
};

export default TeamManagement;