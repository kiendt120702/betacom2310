import React, { useState } from "react";
import { useLeaderTraining, useDeleteLeaderTraining } from "@/hooks/useLeaderTraining";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Video, CheckCircle, AlertCircle, Loader2, Play, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LeaderTrainingExercise } from "@/hooks/useLeaderTraining";
import LeaderVideoUploadDialog from "./LeaderVideoUploadDialog";
import LeaderVideoPreviewDialog from "./LeaderVideoPreviewDialog";
import LeaderVideoDeleteDialog from "./LeaderVideoDeleteDialog";
import EditLeaderTrainingDialog from "./EditLeaderTrainingDialog";

const LeaderTrainingVideoManagement: React.FC = () => {
  const { data: exercises, isLoading, refetch } = useLeaderTraining();
  const deleteExercise = useDeleteLeaderTraining();
  
  const [selectedExercise, setSelectedExercise] = useState<LeaderTrainingExercise | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteVideoOnly, setDeleteVideoOnly] = useState(true);

  const handleOpenUploadDialog = (exercise: LeaderTrainingExercise) => {
    setSelectedExercise(exercise);
    setIsUploadDialogOpen(true);
  };

  const handleOpenPreviewDialog = (exercise: LeaderTrainingExercise) => {
    setSelectedExercise(exercise);
    setIsPreviewDialogOpen(true);
  };

  const handleOpenEditDialog = (exercise: LeaderTrainingExercise) => {
    setSelectedExercise(exercise);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (exercise: LeaderTrainingExercise, videoOnly: boolean = true) => {
    setSelectedExercise(exercise);
    setDeleteVideoOnly(videoOnly);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setIsUploadDialogOpen(false);
    setIsPreviewDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedExercise(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Quản lý Video Đào tạo Leader
          </CardTitle>
          <CardDescription>
            Thêm hoặc thay đổi video cho từng bài tập trong quy trình đào tạo Leader.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Trạng thái Video</TableHead>
                  <TableHead className="w-32 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExercises.map((exercise, index) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{exercise.title}</div>
                        {exercise.description && (
                          <div className="text-sm text-muted-foreground">
                            {exercise.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {exercise.is_required ? (
                            <Badge variant="default" className="text-xs">
                              Bắt buộc
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Tùy chọn
                            </Badge>
                          )}
                          {exercise.min_review_videos && exercise.min_review_videos > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.min_review_videos} video ôn tập
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {exercise.video_url ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Đã có video</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Chưa có video</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Upload Button */}
                        <Button
                          variant={exercise.video_url ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleOpenUploadDialog(exercise)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {exercise.video_url ? "Thay đổi" : "Upload"}
                        </Button>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {exercise.video_url && (
                              <>
                                <DropdownMenuItem onClick={() => handleOpenPreviewDialog(exercise)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Xem trước video
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(exercise)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa bài tập
                            </DropdownMenuItem>
                            {exercise.video_url && (
                              <DropdownMenuItem 
                                onClick={() => handleOpenDeleteDialog(exercise, true)}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa chỉ video
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleOpenDeleteDialog(exercise, false)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa toàn bộ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {selectedExercise && (
        <LeaderVideoUploadDialog
          exercise={selectedExercise}
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onSuccess={handleSuccess}
        />
      )}

      {/* Preview Dialog */}
      {selectedExercise && (
        <LeaderVideoPreviewDialog
          exercise={selectedExercise}
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        />
      )}

      {/* Edit Dialog */}
      {selectedExercise && (
        <EditLeaderTrainingDialog
          exercise={selectedExercise}
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedExercise(null);
            refetch();
          }}
        />
      )}

      {/* Delete Dialog */}
      {selectedExercise && (
        <LeaderVideoDeleteDialog
          exercise={selectedExercise}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleSuccess}
          deleteVideoOnly={deleteVideoOnly}
        />
      )}
    </div>
  );
};

export default LeaderTrainingVideoManagement;