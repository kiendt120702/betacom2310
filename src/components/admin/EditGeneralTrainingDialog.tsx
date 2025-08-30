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
  });
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const updateExercise = useUpdateGeneralTraining();
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const { toast } = useToast();
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();

  const roleOptions = useMemo(() => roles.map(r => ({ value: r.description || r.name, label: r.description || r.name })), [roles]);
  const teamOptions = useMemo(() => teams.map(t => ({ value: t.id, label: t.name })), [teams]);
  const roleLabelToValueMap = useMemo(() => new Map(roles.map(r => [r.description || r.name, r.name])), [roles]);
  const roleValueToLabelMap = useMemo(() => new Map(roles.map(r => [r.name, r.description || r.name])), [roles]);

  useEffect(() => {
    if (exercise) {
      const initialRoleValues = (exercise as any).target_roles || [];
      const initialRoleLabels = initialRoleValues.map((val: string) => roleValueToLabelMap.get(val) || val);
      setFormData({
        title: exercise.title || "",
        target_roles: initialRoleLabels,
        target_team_ids: (exercise as any).target_team_ids || [],
      });
      setTags(((exercise as any).tags || []).join(', '));
      setCurrentVideoUrl(exercise.video_url || "");
      setVideoFile(null);
    }
  }, [exercise, roles]);

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

    const rolesToSave = formData.target_roles.map(label => roleLabelToValueMap.get(label) || label);
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    await updateExercise.mutateAsync({ 
      id: exercise.id, 
      title: formData.title,
      target_roles: rolesToSave,
      target_team_ids: formData.target_team_ids,
      video_url: videoUrl || undefined,
      tags: tagsArray,
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
              <Label htmlFor="tags">Tags (cách nhau bởi dấu phẩy)</Label>
              <Input 
                id="tags" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)}
                placeholder="ví dụ: quy định, văn hóa, onboarding"
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