import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGeneralTraining } from "@/hooks/useGeneralTraining";
import VideoUpload from "@/components/VideoUpload";
import { useUnifiedVideoUpload } from "@/hooks/useUnifiedVideoUpload";
import { useToast } from "@/hooks/use-toast";
import MultiSelect from "@/components/ui/MultiSelect";
import { useRoles } from "@/hooks/useRoles";
import { useTeams } from "@/hooks/useTeams";

interface CreateGeneralTrainingDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateGeneralTrainingDialog: React.FC<CreateGeneralTrainingDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    target_roles: [] as string[],
    target_team_ids: [] as string[],
  });
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const createExercise = useCreateGeneralTraining();
  const { uploadVideo, uploading, progress } = useUnifiedVideoUpload();
  const { toast } = useToast();
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();

  const roleOptions = useMemo(() => roles.map(r => ({ value: r.description || r.name, label: r.description || r.name })), [roles]);
  const teamOptions = useMemo(() => teams.map(t => ({ value: t.id, label: t.name })), [teams]);
  const roleLabelToValueMap = useMemo(() => new Map(roles.map(r => [r.description || r.name, r.name])), [roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let videoUrl = "";

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

    await createExercise.mutateAsync({
      ...formData,
      target_roles: rolesToSave,
      video_url: videoUrl,
      tags: tagsArray,
    });

    onClose();
    setFormData({ title: "", target_roles: [], target_team_ids: [] });
    setTags("");
    setVideoFile(null);
  };

  const isSubmitting = uploading || createExercise.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm bài học chung mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên bài học *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">Video bài học</Label>
              <VideoUpload
                onFileSelected={setVideoFile}
                selectedFile={videoFile}
                uploading={uploading}
                uploadProgress={progress.percentage}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Tạo bài học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGeneralTrainingDialog;