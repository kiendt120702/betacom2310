import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GoalSettingTableRow from "./GoalSettingTableRow";

const GoalSettingTable = ({ monthlyShopTotals, onEditShop, onSaveGoals, isSaving, editingShopId, setEditingShopId }) => {
  if (monthlyShopTotals.length === 0) {
    return (
      <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
        Không có dữ liệu cho các bộ lọc đã chọn.
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
            <TableHead>Nhân sự</TableHead>
            <TableHead>Leader quản lý</TableHead>
            <TableHead className="text-right">Mục tiêu khả thi</TableHead>
            <TableHead className="text-right">Mục tiêu đột phá</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyShopTotals.map((shopTotal, index) => (
            <GoalSettingTableRow
              key={shopTotal.shop_id}
              shopTotal={shopTotal}
              index={index}
              onEditShop={onEditShop}
              onSaveGoals={onSaveGoals}
              isSaving={isSaving && editingShopId === shopTotal.shop_id}
              isEditing={editingShopId === shopTotal.shop_id}
              onCancelEdit={() => setEditingShopId(editingShopId === shopTotal.shop_id ? null : shopTotal.shop_id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GoalSettingTable;