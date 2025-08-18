import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetFeedbackSubmissions, useUpdateFeedbackStatus, FeedbackSubmission } from "@/hooks/useFeedback";
import { MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const FeedbackManagement = () => {
  const { data: submissions, isLoading } = useGetFeedbackSubmissions();
  const updateStatus = useUpdateFeedbackStatus();

  const handleStatusChange = (id: string, status: 'new' | 'in_progress' | 'resolved') => {
    updateStatus.mutate({ id, status });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quản lý Feedback
          </CardTitle>
          <CardDescription>
            Xem và xử lý các phản hồi, báo lỗi từ người dùng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải feedback...</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người gửi</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Trang</TableHead>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map((item: FeedbackSubmission) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.profiles?.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{item.profiles?.email}</div>
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap break-words">{item.content}</TableCell>
                      <TableCell>
                        <a href={item.page_url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      </TableCell>
                      <TableCell>
                        {item.image_url && (
                          <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Xem ảnh
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value: 'new' | 'in_progress' | 'resolved') => handleStatusChange(item.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Mới</SelectItem>
                            <SelectItem value="in_progress">Đang xử lý</SelectItem>
                            <SelectItem value="resolved">Đã giải quyết</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;