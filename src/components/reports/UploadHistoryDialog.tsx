
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, FileText, Calendar, User, Building } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useUploadHistory } from "@/hooks/useUploadHistory";
import { useShops } from "@/hooks/useShops";

interface UploadHistoryDialogProps {
  children: React.ReactNode;
}

const UploadHistoryDialog: React.FC<UploadHistoryDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const { data: shopsData } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];

  const filters = {
    shop_id: selectedShop !== "all" ? selectedShop : undefined,
    month: selectedMonth !== "all" ? selectedMonth : undefined,
  };

  const { data: uploadHistory = [], isLoading } = useUploadHistory(filters);

  const filteredHistory = uploadHistory.filter(record =>
    record.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.uploader_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: vi }),
      });
    }
    return options;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Upload Báo cáo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-3 p-4 border-b">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm file, shop, người upload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả shop</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tháng</SelectItem>
              {generateMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Đang tải...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Tên File</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Người Upload</TableHead>
                  <TableHead>Ngày Upload</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Số bản ghi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có lịch sử upload nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]" title={record.file_name}>
                            {record.file_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {record.shop_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(record.month_year + "-01"), "MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {record.uploader_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.upload_date), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                      <TableCell>{formatFileSize(record.file_size)}</TableCell>
                      <TableCell>{record.record_count || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "success" ? "default" : "destructive"}>
                          {record.status === "success" ? "Thành công" : "Lỗi"}
                        </Badge>
                        {record.error_message && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]" title={record.error_message}>
                            {record.error_message}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadHistoryDialog;
