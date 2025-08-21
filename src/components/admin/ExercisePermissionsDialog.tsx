import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdateEduExercise } from "@/hooks/useEduExercises";
import { TrainingExercise } from "@/types/training";
import MultiSelect from "@/components/ui/MultiSelect";
import { useRoles } from "@/hooks/useRoles";
import { useTeams } from "@/hooks/useTeams";
import { Loader2 } from "lucide-react";

interface ExercisePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: TrainingExercise | null;
}

const ExercisePermissionsDialog: React.FC<ExercisePermissionsDialogProps> = ({ open, onClose, exercise }) => {
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetTeamIds, setTargetTeamIds] = useState<string[]>([]);
  const updateExercise = useUpdateEduExercise();
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();

  const roleOptions = roles.map(r => ({ value: r.name, label: r.name }));
  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));

  useEffect(() => {
    if (exercise) {
      setTargetRoles((exercise as any).target_roles || []);
      setTargetTeamIds((exercise as any).target_team_ids || []);
    }
  }, [exercise]);

  const handleSubmit = async () => {
    if (!exercise) return;
    await updateExercise.mutateAsync({
      exerciseId: exercise.id,
      target_roles: targetRoles,
      target_team_ids: targetTeamIds,
    }, {
      onSuccess: onClose,
    });
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Phân quyền bài tập</DialogTitle>
          <DialogDescription>
            Chọn vai trò và phòng ban có thể xem bài tập: <strong>{exercise.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Giới hạn cho vai trò</Label>
            <MultiSelect
              options={roleOptions}
              selected={targetRoles}
              onChange={setTargetRoles}
              placeholder="Chọn vai trò..."
            />
            <p className="text-xs text-muted-foreground">Nếu để trống, tất cả vai trò đều có thể xem.</p>
          </div>
          <div className="space-y-2">
            <Label>Giới hạn cho phòng ban</Label>
            <MultiSelect
              options={teamOptions}
              selected={targetTeamIds}
              onChange={setTargetTeamIds}
              placeholder="Chọn phòng ban..."
            />
            <p className="text-xs text-muted-foreground">Nếu để trống, tất cả phòng ban đều có thể xem.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={updateExercise.isPending}>
            {updateExercise.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExercisePermissionsDialog;