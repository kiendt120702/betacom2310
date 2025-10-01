import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Users, Loader2 } from "lucide-react";
import { formatCurrency, parseCurrency } from "@/lib/numberUtils";

const GoalSettingTableRow = ({ shopTotal, index, onEditShop, onSaveGoals, isSaving, onCancelEdit, isEditing }) => {
  const [goals, setGoals] = useState({
    feasible_goal: "",
    breakthrough_goal: "",
  });

  useEffect(() => {
    setGoals({
      feasible_goal: shopTotal.feasible_goal != null ? formatCurrency(shopTotal.feasible_goal) : "",
      breakthrough_goal: shopTotal.breakthrough_goal != null ? formatCurrency(shopTotal.breakthrough_goal) : "",
    });
  }, [shopTotal, isEditing]);

  const handleGoalChange = (field, value) => {
    const numericString = value.replace(/\D/g, "");
    const numberValue = numericString ? parseInt(numericString, 10) : null;
    const formattedValue = numberValue !== null ? formatCurrency(numberValue) : "";
    setGoals(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSave = () => {
    onSaveGoals(shopTotal.shop_id, {
      feasible_goal: parseCurrency(goals.feasible_goal),
      breakthrough_goal: parseCurrency(goals.breakthrough_goal),
    });
  };

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="font-medium">{shopTotal.shop_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.personnel_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.leader_name}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {isEditing ? (
          <Input
            type="text"
            inputMode="numeric"
            value={goals.feasible_goal}
            onChange={(e) => handleGoalChange("feasible_goal", e.target.value)}
            className="w-28 text-right h-8 px-2 py-1"
            disabled={isSaving}
            placeholder="0"
          />
        ) : shopTotal.feasible_goal != null ? (
          <span>{formatCurrency(shopTotal.feasible_goal)}</span>
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {isEditing ? (
          <Input
            type="text"
            inputMode="numeric"
            value={goals.breakthrough_goal}
            onChange={(e) => handleGoalChange("breakthrough_goal", e.target.value)}
            className="w-28 text-right h-8 px-2 py-1"
            disabled={isSaving}
            placeholder="0"
          />
        ) : shopTotal.breakthrough_goal != null ? (
          <span>{formatCurrency(shopTotal.breakthrough_goal)}</span>
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={onCancelEdit} disabled={isSaving}>Hủy</Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lưu...</> : "Lưu"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEditShop(shopTotal)} className="h-8 w-8 p-0" title="Sửa thông tin shop">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onCancelEdit(shopTotal.shop_id)} disabled={isSaving} className="h-8 w-8 p-0" title="Sửa mục tiêu">
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default GoalSettingTableRow;