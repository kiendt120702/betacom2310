
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, FileText, User, Building } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
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
                  <TableHead className="w-[60px]">STT</TableHead>
                  <TableHead>Người Upload</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Tên File</TableHead>
                  <TableHead>Ngày Upload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có lịch sử upload nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{record.uploader_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{record.shop_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[250px]" title={record.file_name}>
                            {record.file_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.upload_date), "dd/MM/yyyy HH:mm", { locale: vi })}
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
