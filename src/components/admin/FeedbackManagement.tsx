import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquarePlus, CheckCircle, XCircle, Eye, Trash2, Loader2, Image as ImageIcon, User } from "lucide-react";
import { useFeedback, useUpdateFeedback, useDeleteFeedback, Feedback, FeedbackStatus } from "@/hooks/useFeedback";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import LazyImage from "@/components/LazyImage";

const FeedbackManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('pending');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: feedbackList = [], isLoading } = useFeedback({ status: statusFilter });
  const updateFeedbackMutation = useUpdateFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();
  const { data: userProfile } = useUserProfile();

  const getStatusBadgeVariant = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800';
      case 'suggestion': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  const handleUpdateStatus = (feedbackId: string, newStatus: FeedbackStatus) => {
    if (!userProfile) return;
    updateFeedbackMutation.mutate({
      id: feedbackId,
      status: newStatus,
      resolved_by: newStatus === 'resolved' ? userProfile.id : null,
      resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
    });
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    deleteFeedbackMutation.mutate(feedbackId);
  };

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
  };

  const getSenderName = (feedback: Feedback) => {
    if (feedback.profiles) {
      return feedback.profiles.full_name || feedback.profiles.email;
    }
    if (feedback.user_id === null) {
      return "Người dùng đã xóa";
    }
    // If profiles is null but user_id is not null, try to use email from auth.users
    if (feedback.user_email_from_auth) {
      return feedback.user_email_from_auth;
    }
    // Fallback to ID if no other info is available
    return `Thông tin không có sẵn (ID: ${feedback.user_id.substring(0, 8)}...)`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Góp ý & Báo lỗi</h1>
        <p className="text-muted-foreground mt-2">
          Xem và quản lý các góp ý, báo lỗi từ người dùng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Danh sách Góp ý
          </CardTitle>
          <CardDescription>
            Tổng cộng: {feedbackList.length} góp ý
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={(value: FeedbackStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="reviewed">Đã xem</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">Đang tải feedback...</p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có góp ý nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Người gửi</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead className="w-[120px]">Ảnh</TableHead>
                    <TableHead className="w-[120px]">Ngày gửi</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="text-right w-[150px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">
                        {getSenderName(feedback)}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {feedback.content}
                      </TableCell>
                      <TableCell>
                        {feedback.image_url ? (
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(feedback)}>
                            <ImageIcon className="h-4 w-4 mr-2" /> Xem ảnh
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Không có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(feedback.created_at!), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={feedback.status!}
                          onValueChange={(value: FeedbackStatus) => handleUpdateStatus(feedback.id, value)}
                          disabled={updateFeedbackMutation.isPending}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="reviewed">Đã xem</SelectItem>
                            <SelectItem value="resolved">Đã giải quyết</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(feedback)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa feedback</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa feedback này? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteFeedback(feedback.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

      {selectedFeedback && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Chi tiết Góp ý</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về góp ý từ người dùng.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Người gửi:</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{getSenderName(selectedFeedback)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nội dung:</p>
                <p className="mt-1 p-3 border rounded-md bg-muted/50 whitespace-pre-wrap">{selectedFeedback.content}</p>
              </div>
              {selectedFeedback.image_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ảnh đính kèm:</p>
                  <div className="mt-1 w-full h-64 border rounded-md overflow-hidden bg-muted">
                    <LazyImage src={selectedFeedback.image_url} alt="Feedback Image" className="w-full h-full object-contain" />
                  </div>
                  <a href={selectedFeedback.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 block">
                    Mở ảnh gốc
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày gửi:</p>
                <p className="mt-1">{format(new Date(selectedFeedback.created_at!), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái:</p>
                <Badge variant={getStatusBadgeVariant(selectedFeedback.status!)} className={`mt-1 ${getStatusBadgeColor(selectedFeedback.status!)}`}>
                  {selectedFeedback.status === 'pending' ? 'Chờ xử lý' : selectedFeedback.status === 'reviewed' ? 'Đã xem' : 'Đã giải quyết'}
                </Badge>
              </div>
              {selectedFeedback.resolved_by && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đã giải quyết bởi:</p>
                  <p className="mt-1">{selectedFeedback.profiles?.full_name || selectedFeedback.profiles?.email || "N/A"}</p>
                </div>
              )}
              {selectedFeedback.resolved_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày giải quyết:</p>
                  <p className="mt-1">{format(new Date(selectedFeedback.resolved_at!), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeedbackManagement;