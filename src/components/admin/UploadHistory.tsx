import React, { useState, useMemo } from "react";
import { useUploadHistory } from "@/hooks/useUploadHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, History } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { useShops } from "@/hooks/useShops";

const UploadHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data, isLoading } = useUploadHistory({ page: currentPage, pageSize: itemsPerPage });
  const { data: shopsData } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });

  const history = data?.history || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize: itemsPerPage,
  });

  const shopsMap = useMemo(() => {
    if (!shopsData?.shops) return new Map();
    return new Map(shopsData.shops.map(shop => [shop.id, shop.name]));
  }, [shopsData]);

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
                <TableHead>Shop</TableHead>
                <TableHead>Tên file</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? history.map((item) => {
                const details = item.details as any;
                const shopName = details?.shop_id ? shopsMap.get(details.shop_id) || 'Không rõ' : 'N/A';
                const action = details?.action === 'ghi đè' ? 'Chỉnh sửa' : 'Thêm mới';

                return (
                  <TableRow key={item.id}>
                    <TableCell>{shopName}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.file_name}</TableCell>
                    <TableCell>{format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                    <TableCell>
                      <Badge variant={action === 'Chỉnh sửa' ? 'secondary' : 'outline'}>
                        {action}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Không có lịch sử upload.</TableCell>
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