import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GoalSettingProvider, useGoalSettingContext } from '@/contexts/GoalSettingContext';
import GoalSettingHeader from '@/components/goal-setting/GoalSettingHeader';
import GoalSettingFilters from '@/components/goal-setting/GoalSettingFilters';
import GoalSettingTable from '@/components/goal-setting/GoalSettingTable';
import ShopDialog from "@/components/admin/ShopDialog";

const GoalSettingContent: React.FC = () => {
  const { isShopDialogOpen, setIsShopDialogOpen, editingShop } = useGoalSettingContext();

  return (
    <div className="space-y-6">
      <GoalSettingHeader />
      <Card>
        <CardHeader>
          <GoalSettingFilters />
        </CardHeader>
        <CardContent>
          <GoalSettingTable />
        </CardContent>
      </Card>
      <ShopDialog
        open={isShopDialogOpen}
        onOpenChange={setIsShopDialogOpen}
        shop={editingShop}
      />
    </div>
  );
};

const GoalSettingPage: React.FC = () => {
  return (
    <GoalSettingProvider>
      <GoalSettingContent />
    </GoalSettingProvider>
  );
};

export default GoalSettingPage;