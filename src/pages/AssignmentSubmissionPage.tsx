
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignments, useAssignmentSubmissions, useSubmitAssignment } from "@/hooks/useAssignments";
import { useTrainingCourses } from "@/hooks/useTrainingCourses";
import { FileUp, Clock, CheckCircle, XCircle, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const AssignmentSubmissionPage = () => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data: assignments, isLoading: assignmentsLoading } = useAssignments();
  const { data: courses } = useTrainingCourses();
  const { data: submissions } = useAssignmentSubmissions(selectedAssignmentId || undefined);
  const submitAssignment = useSubmitAssignment();

  const selectedAssignment = assignments?.find(a => a.id === selectedAssignmentId);
  const mySubmission = submissions?.find(s => s.assignment_id === selectedAssignmentId);

  const handleSubmit = () => {
    if (!selectedAssignmentId) return;

    submitAssignment.mutate({
      assignment_id: selectedAssignmentId,
      content: submissionContent,
      file_url: fileUrl || undefined,
    }, {
      onSuccess: () => {
        setSubmissionContent("");
        setFileUrl("");
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reviewed':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Bị từ chối';
      case 'reviewed':
        return 'Đã xem xét';
      default:
        return 'Không xác định';
    }
  };

  if (assignmentsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nộp bài tập</h1>
        <p className="text-muted-foreground">
          Chọn bài tập và nộp phần ôn tập của bạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Danh sách bài tập */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài tập</CardTitle>
            <CardDescription>
              Chọn bài tập bạn muốn nộp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments && assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const course = courses?.find(c => c.id === assignment.course_id);
                  const isSelected = assignment.id === selectedAssignmentId;
                  const submission = submissions?.find(s => s.assignment_id === assignment.id);
                  
                  return (
                    <Card 
                      key={assignment.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium line-clamp-2">{assignment.title}</h3>
                            {submission && (
                              <div className="flex items-center gap-1">
                                {getStatusIcon(submission.status)}
                                <span className="text-xs">{getStatusText(submission.status)}</span>
                              </div>
                            )}
                          </div>
                          
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Khóa: {course?.title || "N/A"}</span>
                            {assignment.due_date && (
                              <span>
                                Hạn: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có bài tập nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form nộp bài */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAssignment ? `Nộp bài: ${selectedAssignment.title}` : "Chọn bài tập"}
            </CardTitle>
            <CardDescription>
              {selectedAssignment 
                ? "Điền nội dung và nộp bài tập của bạn" 
                : "Vui lòng chọn bài tập từ danh sách bên trái"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAssignment ? (
              <div className="space-y-6">
                {/* Thông tin bài tập */}
                <div className="space-y-2">
                  {selectedAssignment.description && (
                    <div>
                      <Label className="text-sm font-medium">Mô tả:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAssignment.description}
                      </p>
                    </div>
                  )}
                  
                  {selectedAssignment.instructions && (
                    <div>
                      <Label className="text-sm font-medium">Hướng dẫn:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAssignment.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hiển thị bài đã nộp (nếu có) */}
                {mySubmission && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getStatusIcon(mySubmission.status)}
                        Bài đã nộp - {getStatusText(mySubmission.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mySubmission.content && (
                        <div>
                          <Label className="text-xs">Nội dung:</Label>
                          <p className="text-sm bg-muted p-3 rounded mt-1">{mySubmission.content}</p>
                        </div>
                      )}
                      {mySubmission.file_url && (
                        <div>
                          <Label className="text-xs">File đính kèm:</Label>
                          <p className="text-sm text-blue-600 mt-1">{mySubmission.file_url}</p>
                        </div>
                      )}
                      {mySubmission.feedback && (
                        <div>
                          <Label className="text-xs">Phản hồi:</Label>
                          <p className="text-sm bg-blue-50 p-3 rounded mt-1">{mySubmission.feedback}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Nộp lúc: {new Date(mySubmission.submitted_at).toLocaleString("vi-VN")}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Form nộp bài mới */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content">Nội dung bài tập *</Label>
                    <Textarea
                      id="content"
                      placeholder="Nhập nội dung bài tập của bạn..."
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">File đính kèm (tùy chọn)</Label>
                    <Input
                      id="file"
                      type="url"
                      placeholder="Nhập link file Google Drive, Dropbox, v.v..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={!submissionContent.trim() || submitAssignment.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitAssignment.isPending ? "Đang nộp..." : "Nộp bài tập"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileUp className="h-12 w-12 mx-auto mb-4" />
                <p>Chọn bài tập từ danh sách để bắt đầu nộp bài</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentSubmissionPage;
