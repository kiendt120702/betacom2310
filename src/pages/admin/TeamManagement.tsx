import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, Team } from '@/hooks/useTeams';

const TeamManagement: React.FC = () => {
  const { data: teams = [], isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');

  const handleOpenDialog = (team: Team | null = null) => {
    setEditingTeam(team);
    setTeamName(team ? team.name : '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setTeamName('');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Quản lý Team
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Thêm, sửa, và xóa các team trong hệ thống.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Team
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {teams.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có team nào</h3>
              <p className="text-muted-foreground mb-4">Tạo team đầu tiên để bắt đầu quản lý nhóm làm việc.</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Team Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground font-medium px-4 md:px-6">Tên Team</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium px-4 md:px-6">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map(team => (
                    <TableRow key={team.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground px-4 md:px-6 py-4">{team.name}</TableCell>
                      <TableCell className="text-right px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDialog(team)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Bạn có chắc chắn muốn xóa team "{team.name}"? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Hủy</AlertDialogCancel>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingTeam ? 'Sửa Team' : 'Thêm Team Mới'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingTeam ? 'Thay đổi tên của team.' : 'Thêm một team mới vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nhập tên team..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;