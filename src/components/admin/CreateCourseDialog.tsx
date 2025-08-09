
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    min_study_sessions: 1,
    min_review_videos: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      // Get the highest order_index to ensure new course goes to the end
      const { data: existingCourses } = await supabase
        .from("training_courses")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = existingCourses?.[0]?.order_index 
        ? existingCourses[0].order_index + 1 
        : 1;

      const { error } = await supabase
        .from("training_courses")
        .insert({
          ...formData,
          created_by: user.id,
          order_index: nextOrderIndex,
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Khóa học đã được tạo thành công",
      });

      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      onClose();
      setFormData({
        title: "",
        description: "",
        min_study_sessions: 1,
        min_review_videos: 0,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo khóa học mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên khóa học *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tên khóa học"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả khóa học"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_study_sessions">Số lần học tối thiểu</Label>
              <Input
                id="min_study_sessions"
                type="number"
                min="1"
                value={formData.min_study_sessions}
                onChange={(e) => setFormData(prev => ({ ...prev, min_study_sessions: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_review_videos">Số video ôn tập</Label>
              <Input
                id="min_review_videos"
                type="number"
                min="0"
                value={formData.min_review_videos}
                onChange={(e) => setFormData(prev => ({ ...prev, min_review_videos: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
