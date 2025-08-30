import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import VideoUpload from "@/components/VideoUpload";
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";
import { useToast } from "@/hooks/use-toast";
import MultiSelect from "@/components/ui/MultiSelect";
import { useRoles } from "@/hooks/useRoles";
import { useTeams } from "@/hooks/useTeams";
import { useTags } from "@/hooks/useTags";

interface EditGeneralTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  exercise: GeneralTrainingExercise;
}

const EditGeneralTrainingDialog: React.FC<EditGeneralTrainingDialogProps> = ({ open, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    title: "",
    target_roles: [] as string[],
    target_team_ids: [] as string[],
    tag_ids: [] as string[],
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const updateExercise = useUpdateGeneralTraining();
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const { toast } = useToast();
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();
  const { data: tags = [] } = useTags();

  const roleOptions = useMemo(() => roles.map(r => ({ value: r.name, label: r.description || r.name })), [roles]);
  const teamOptions = useMemo(() => teams.map(t => ({ value: t.id, label: t.name })), [teams]);
  const tagOptions = useMemo(() => tags.map(t => ({ value: t.id, label: t.name })), [tags]);

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || "",
        target_roles: (exercise as any).target_roles || [],
        target_team_ids: (exercise as any).target_team_ids || [],
        tag_ids: (exercise as any).tags?.map((t: any) => t.id) || [],
      });
      setCurrentVideoUrl(exercise.video_url || "");
      setVideoFile(null);
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let videoUrl = exercise.video_url;

    if (videoFile) {
      const result = await uploadVideo(videoFile);
      if (result.error || !result.url) {
        toast({
          title: "Lỗi upload video",
          description: result.error || "Không thể lấy URL video.",
          variant: "destructive",
        });
        return;
      }
      videoUrl = result.url;
    }

    await updateExercise.mutateAsync({ 
      id: exercise.id, 
      ...formData,
      video_url: videoUrl || undefined,
    });
    
    onClose();
  };

  const handleFileSelected = (file: File | null) => {
    setVideoFile(file);
    if (file) {
      setCurrentVideoUrl(URL.createObjectURL(file));
    } else {
      setCurrentVideoUrl(exercise.video_url || "");
    }
  };

  const isSubmitting = uploading || updateExercise.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học chung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên bài học *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">Video bài học</Label>
              <VideoUpload
                onFileSelected={handleFileSelected}
                currentVideoUrl={currentVideoUrl}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <MultiSelect
                options={tagOptions}
                selected={formData.tag_ids}
                onChange={(selected) => setFormData(prev => ({ ...prev, tag_ids: selected }))}
                placeholder="Chọn tags..."
              />
            </div>
            <div className="space-y-2">
              <Label>Giới hạn cho vai trò</Label>
              <MultiSelect
                options={roleOptions}
                selected={formData.target_roles}
                onChange={(selected) => setFormData(prev => ({ ...prev, target_roles: selected }))}
                placeholder="Chọn vai trò (để trống cho mọi người)"
              />
            </div>
            <div className="space-y-2">
              <Label>Giới hạn cho phòng ban</Label>
              <MultiSelect
                options={teamOptions}
                selected={formData.target_team_ids}
                onChange={(selected) => setFormData(prev => ({ ...prev, target_team_ids: selected }))}
                placeholder="Chọn phòng ban (để trống cho mọi người)"
              />
            </div>
          </fieldset>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGeneralTrainingDialog;