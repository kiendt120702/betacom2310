import React, { useState } from "react";
import { useUploadHistory } from "@/hooks/useUploadHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, CheckCircle, XCircle, History } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";

const UploadHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading } = useUploadHistory({ page: currentPage, pageSize: itemsPerPage });

  const history = data?.history || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const fileTypeLabels: Record<string, string> = {
    'multi_day_comprehensive_report': 'Báo cáo nhiều ngày',
    'comprehensive_report': 'Báo cáo tổng hợp',
    'revenue_report': 'Báo cáo doanh thu',
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin" />
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Tên file</TableHead>
                <TableHead>Loại file</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.profiles?.full_name || item.profiles?.email || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.file_name}</TableCell>
                  <TableCell>{fileTypeLabels[item.file_type] || item.file_type}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'success' ? 'default' : 'destructive'} className={item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                  <TableCell>
                    <pre className="text-xs bg-muted p-1 rounded max-w-xs overflow-auto">{JSON.stringify(item.details, null, 2)}</pre>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">Không có lịch sử upload.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
            <div className="mt-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                        {paginationRange?.map((pageNumber, index) => {
                            if (pageNumber === DOTS) {
                                return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                            }
                            return (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink onClick={() => setCurrentPage(pageNumber as number)} isActive={currentPage === pageNumber}>
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadHistory;