
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTrainingVideos } from "@/hooks/useTrainingCourses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Video } from "lucide-react";
import { TrainingCourse } from "@/hooks/useTrainingCourses";

interface ManageVideosDialogProps {
  open: boolean;
  onClose: () => void;
  course: TrainingCourse;
}

const ManageVideosDialog: React.FC<ManageVideosDialogProps> = ({ open, onClose, course }) => {
  const { data: videos, isLoading } = useTrainingVideos(course.id);
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    video_url: "",
    duration: "",
    is_review_video: false,
  });

  const handleAddVideo = () => {
    toast({
      title: "Thông báo",
      description: "Tính năng thêm video sẽ được triển khai",
    });
    setShowAddForm(false);
    setNewVideo({
      title: "",
      video_url: "",
      duration: "",
      is_review_video: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý Video - {course.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Tổng cộng: {videos?.length || 0} video
            </p>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm video
            </Button>
          </div>

          {showAddForm && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Thêm video mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-title">Tiêu đề video</Label>
                    <Input
                      id="video-title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nhập tiêu đề video"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-url">URL Video</Label>
                    <Input
                      id="video-url"
                      value={newVideo.video_url}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-duration">Thời lượng (phút)</Label>
                    <Input
                      id="video-duration"
                      type="number"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="30"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-review"
                      checked={newVideo.is_review_video}
                      onCheckedChange={(checked) => setNewVideo(prev => ({ ...prev, is_review_video: checked }))}
                    />
                    <Label htmlFor="is-review">Video ôn tập</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddVideo}>
                    Thêm video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-6">Đang tải video...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos?.map((video, index) => (
                <Card key={video.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                      <Badge variant={video.is_review_video ? "secondary" : "default"}>
                        {video.is_review_video ? "Ôn tập" : "Học tập"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Video #{index + 1} • {video.duration ? `${video.duration} phút` : "Chưa xác định"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Edit className="w-3 h-3" />
                        Sửa
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Video className="w-3 h-3" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" className="px-2 text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {videos?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có video nào</h3>
              <p className="text-muted-foreground">
                Thêm video đầu tiên cho khóa học này
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageVideosDialog;
