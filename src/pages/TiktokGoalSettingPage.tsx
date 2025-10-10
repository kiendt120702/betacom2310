import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TiktokGoalSettingProvider, useTiktokGoalSettingContext } from '@/contexts/TiktokGoalSettingContext';
import TiktokGoalSettingHeader from '@/components/tiktok-goal-setting/TiktokGoalSettingHeader';
import TiktokGoalSettingFilters from '@/components/tiktok-goal-setting/TiktokGoalSettingFilters';
import TiktokGoalSettingTable from '@/components/tiktok-goal-setting/TiktokGoalSettingTable';
import { CreateShopDialog, EditShopDialog } from "@/components/tiktok-shops/TiktokShopDialogs";

const TiktokGoalSettingContent: React.FC = () => {
  const {
    isCreateDialogOpen,
    closeCreateDialog,
    formData,
    setFormData,
    users,
    handleCreateShopSubmit,
    createShop,
    isEditDialogOpen,
    closeEditDialog,
    handleEditShopSubmit,
    updateShop,
  } = useTiktokGoalSettingContext();

  return (
    <div className="space-y-6">
      <TiktokGoalSettingHeader />
      <Card>
        <CardHeader>
          <TiktokGoalSettingFilters />
        </CardHeader>
        <CardContent>
          <TiktokGoalSettingTable />
        </CardContent>
      </Card>
      <CreateShopDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        formData={formData}
        setFormData={setFormData}
        users={users}
        onSubmit={handleCreateShopSubmit}
        isSubmitting={createShop.isPending}
      />
      <EditShopDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        formData={formData}
        setFormData={setFormData}
        users={users}
        onSubmit={handleEditShopSubmit}
        isSubmitting={updateShop.isPending}
      />
    </div>
  );
};

const TiktokGoalSettingPage: React.FC = () => {
  return (
    <TiktokGoalSettingProvider>
      <TiktokGoalSettingContent />
    </TiktokGoalSettingProvider>
  );
};

export default TiktokGoalSettingPage;