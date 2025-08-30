import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Library, CheckCircle, AlertCircle } from "lucide-react";
import StandardManagementLayout from "@/components/management/StandardManagementLayout";
import { useGeneralTraining, useDeleteGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import CreateGeneralTrainingDialog from "./CreateGeneralTrainingDialog";
import EditGeneralTrainingDialog from "./EditGeneralTrainingDialog";
import { Badge } from "@/components/ui/badge";
import { useTeams } from "@/hooks/useTeams";
import { useRoles } from "@/hooks/useRoles";

const GeneralTrainingManagement: React.FC = () => {
  const { data: generalExercises = [], isLoading } = useGeneralTraining();
  const deleteExerciseMutation = useDeleteGeneralTraining();
  const { data: teams = [] } = useTeams();
  const { data: roles = [] } = useRoles();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<GeneralTrainingExercise | null>(null);

  const teamsMap = useMemo(() => new Map(teams.map(t => [t.id, t.name])), [teams]);
  const rolesMap = useMemo(() => new Map(roles.map(r => [r.name, r.description || r.name])), [roles]);

  const handleEditExercise = (exercise: GeneralTrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    await deleteExerciseMutation.mutateAsync(exerciseId);
  };

  return (
    <>
      <StandardManagementLayout
        title="Quản lý Đào tạo Chung"
        description="Quản lý các bài học và tài liệu đào tạo chung cho toàn công ty (ví dụ: quy định, văn hóa doanh nghiệp)."
        icon={Library}
        isLoading={isLoading}
        isEmpty={generalExercises.length === 0}
        actionButton={{
          label: "Thêm bài học chung",
          onClick: () => setCreateDialogOpen(true),
          icon: Plus,
        }}
        emptyState={{
          icon: Library,
          title: "Chưa có bài học chung nào",
          description: "Tạo bài học chung đầu tiên để bắt đầu.",
          actionButton: {
            label: "Thêm bài học chung",
            onClick: () => setCreateDialogOpen(true),
            icon: Plus,
          },
        }}
      >
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên bài học</TableHead>
                <TableHead>Phân quyền</TableHead>
                <TableHead className="text-center">Video</TableHead>
                <TableHead className="w-32 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generalExercises.map((exercise, index) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{exercise.title}</div>
                    {exercise.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {exercise.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(exercise as any).target_roles?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(exercise as any).target_roles.map((role: string) => (
                            <Badge key={role} variant="secondary">{rolesMap.get(role) || role}</Badge>
                          ))}
                        </div>
                      )}
                      {(exercise as any).target_team_ids?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(exercise as any).target_team_ids.map((teamId: string) => (
                            <Badge key={teamId} variant="outline">{teamsMap.get(teamId) || 'Không rõ'}</Badge>
                          ))}
                        </div>
                      )}
                      {(!(exercise as any).target_roles || (exercise as any).target_roles.length === 0) &&
                       (!(exercise as any).target_team_ids || (exercise as any).target_team_ids.length === 0) && (
                        <span className="text-xs text-muted-foreground">Mọi người</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {exercise.video_url ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)} className="h-8 w-8 p-0" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Xóa" disabled={deleteExerciseMutation.isPending}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa bài học</AlertDialogTitle>
                            <AlertDialogDescription>Bạn có chắc chắn muốn xóa bài học "{exercise.title}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteExerciseMutation.isPending}>
                              {deleteExerciseMutation.isPending ? "Đang xóa..." : "Xóa"}
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
      </StandardManagementLayout>

      <CreateGeneralTrainingDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      {selectedExercise && (
        <EditGeneralTrainingDialog 
          open={editDialogOpen} 
          onClose={() => { setEditDialogOpen(false); setSelectedExercise(null); }} 
          exercise={selectedExercise} 
        />
      )}
    </>
  );
};

export default GeneralTrainingManagement;