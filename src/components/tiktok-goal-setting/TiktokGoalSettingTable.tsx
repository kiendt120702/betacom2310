import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTiktokGoalSettingContext } from '@/contexts/TiktokGoalSettingContext';
import TiktokGoalSettingTableRow from './TiktokGoalSettingTableRow';
import { Loader2 } from 'lucide-react';

const TiktokGoalSettingTable: React.FC = () => {
  const { monthlyShopTotals, isLoading } = useTiktokGoalSettingContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên Shop</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Nhân sự</TableHead>
            <TableHead className="text-right">Mục tiêu khả thi</TableHead>
            <TableHead className="text-right">Mục tiêu đột phá</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyShopTotals.length > 0 ? (
            monthlyShopTotals.map((shopTotal, index) => (
              <TiktokGoalSettingTableRow key={shopTotal.shop_id} shop={shopTotal} index={index} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                Không có dữ liệu cho tháng đã chọn.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TiktokGoalSettingTable;