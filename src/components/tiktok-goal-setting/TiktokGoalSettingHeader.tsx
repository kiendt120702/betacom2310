import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTiktokGoalSettingContext } from '@/contexts/TiktokGoalSettingContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useUserProfile } from '@/hooks/useUserProfile';

const TiktokGoalSettingHeader: React.FC = () => {
  const { openCreateDialog } = useTiktokGoalSettingContext();
  const { data: currentUserProfile } = useUserProfile();
  const { canEditGoals } = useUserPermissions(currentUserProfile);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mục Tiêu Tháng Shop TikTok</h1>
        <p className="text-muted-foreground mt-2">
          Thiết lập và theo dõi mục tiêu doanh số cho các shop TikTok.
        </p>
      </div>
      {canEditGoals && (
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Shop
        </Button>
      )}
    </div>
  );
};

export default TiktokGoalSettingHeader;