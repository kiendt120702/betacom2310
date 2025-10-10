import React, { useState, useEffect, useMemo } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrency } from "@/lib/numberUtils";
import { useTiktokGoalSettingContext } from '@/contexts/TiktokGoalSettingContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TiktokGoalSettingTableRowProps {
  shop: any;
  index: number;
}

const TiktokGoalSettingTableRow: React.FC<TiktokGoalSettingTableRowProps> = ({ shop, index }) => {
  const { updateGoalsMutation, selectedMonth, openEditDialog } = useTiktokGoalSettingContext();
  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader, isChuyenVien } = useUserPermissions(currentUserProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState({
    feasible_goal: formatCurrency(shop.feasible_goal),
    breakthrough_goal: formatCurrency(shop.breakthrough_goal),
  });

  useEffect(() => {
    setGoals({
      feasible_goal: formatCurrency(shop.feasible_goal),
      breakthrough_goal: formatCurrency(shop.breakthrough_goal),
    });
    setIsEditing(false);
  }, [shop]);

  const canEditThisShop = useMemo(() => {
    if (!currentUserProfile) return false;
    if (isAdmin || isLeader) return true;
    if (isChuyenVien && shop.personnel_id === currentUserProfile.id) return true;
    return false;
  }, [currentUserProfile, isAdmin, isLeader, isChuyenVien, shop.personnel_id]);

  const canEditShopDetails = isAdmin || isLeader;

  const handleGoalInputChange = (field: 'feasible_goal' | 'breakthrough_goal', value: string) => {
    const numericString = value.replace(/\D/g, "");
    const numberValue = numericString ? parseInt(numericString, 10) : null;
    const formattedValue = numberValue !== null ? formatCurrency(numberValue) : "";
    setGoals(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSave = () => {
    const feasibleGoalValue = parseCurrency(goals.feasible_goal);
    const breakthroughGoalValue = parseCurrency(goals.breakthrough_goal);

    updateGoalsMutation.mutate({
      shopId: shop.shop_id,
      month: selectedMonth,
      feasible_goal: feasibleGoalValue,
      breakthrough_goal: breakthroughGoalValue,
    }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleCancel = () => {
    setGoals({
      feasible_goal: formatCurrency(shop.feasible_goal),
      breakthrough_goal: formatCurrency(shop.breakthrough_goal),
    });
    setIsEditing(false);
  };

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="font-medium">{shop.shop_name}</TableCell>
      <TableCell className="whitespace-nowrap">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          shop.shop_status === 'Đang Vận Hành' ? 'bg-blue-100 text-blue-800' :
          shop.shop_status === 'Shop mới' ? 'bg-green-100 text-green-800' :
          shop.shop_status === 'Đã Dừng' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        )}>
          {shop.shop_status || 'Chưa có'}
        </span>
      </TableCell>
      <TableCell><Badge variant="outline">{shop.type}</Badge></TableCell>
      <TableCell>{shop.personnel_name}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {isEditing ? (
          <Input type="text" inputMode="numeric" value={goals.feasible_goal || ''} onChange={(e) => handleGoalInputChange('feasible_goal', e.target.value)} className="w-28 text-right h-8 px-2 py-1" disabled={updateGoalsMutation.isPending} placeholder="0" />
        ) : shop.feasible_goal != null ? (
          <span>{formatCurrency(shop.feasible_goal)}</span>
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {isEditing ? (
          <Input type="text" inputMode="numeric" value={goals.breakthrough_goal || ''} onChange={(e) => handleGoalInputChange('breakthrough_goal', e.target.value)} className="w-28 text-right h-8 px-2 py-1" disabled={updateGoalsMutation.isPending} placeholder="0" />
        ) : shop.breakthrough_goal != null ? (
          <span>{formatCurrency(shop.breakthrough_goal)}</span>
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateGoalsMutation.isPending}>Hủy</Button>
              <Button size="sm" onClick={handleSave} disabled={updateGoalsMutation.isPending}>
                {updateGoalsMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lưu...</> : "Lưu"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(shop)} className="h-8 w-8 p-0" title="Sửa thông tin shop" disabled={!canEditShopDetails}>
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={!canEditThisShop} className="h-8" title="Sửa mục tiêu">
                <Edit className="h-4 w-4 mr-1" /> Sửa
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TiktokGoalSettingTableRow;