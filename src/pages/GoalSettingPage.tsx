import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useShops, Shop } from "@/hooks/useShops";
import { useComprehensiveReportDataRefactored as useComprehensiveReportData } from "@/hooks/useComprehensiveReportDataRefactored";
import { useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { generateMonthOptions } from "@/utils/revenueUtils";
import ShopDialog from "@/components/admin/ShopDialog";
import GoalSettingFilters from "@/components/goal-setting/GoalSettingFilters";
import GoalSettingTable from "@/components/goal-setting/GoalSettingTable";
import { Loader2 } from "lucide-react";

const GoalSettingPage: React.FC = React.memo(() => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);

  const { data: currentUserProfile, isLoading: userProfileLoading } = useUserProfile();

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useComprehensiveReportData({
    filters: {
      selectedMonth,
      selectedLeader,
      selectedPersonnel,
      searchTerm: "",
      selectedColorFilter: "all",
      selectedStatusFilter: [],
    },
    sortConfig: null,
  });

  const { data: allShopsData } = useShops({
    page: 1,
    pageSize: 10000,
    searchTerm: "",
    status: "all",
  });
  const allShops = allShopsData?.shops || [];

  const updateReportMutation = useUpdateComprehensiveReport();

  const handleSaveGoals = (shopId: string, goals: { feasible_goal: number | null; breakthrough_goal: number | null }) => {
    updateReportMutation.mutate(
      {
        shopId,
        month: selectedMonth,
        feasible_goal: goals.feasible_goal,
        breakthrough_goal: goals.breakthrough_goal,
      },
      {
        onSuccess: () => setEditingShopId(null),
        onError: () => setEditingShopId(shopId),
      }
    );
  };

  const handleAddShop = () => {
    setEditingShop(null);
    setIsShopDialogOpen(true);
  };

  const handleEditShop = (shopTotal: any) => {
    const shopToEdit = allShops.find(s => s.id === shopTotal.shop_id);
    if (shopToEdit) {
      setEditingShop(shopToEdit);
      setIsShopDialogOpen(true);
    }
  };

  if (userProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <GoalSettingFilters
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthOptions={monthOptions}
            selectedLeader={selectedLeader}
            onLeaderChange={setSelectedLeader}
            leaders={leaders}
            openLeaderSelector={openLeaderSelector}
            setOpenLeaderSelector={setOpenLeaderSelector}
            selectedPersonnel={selectedPersonnel}
            onPersonnelChange={setSelectedPersonnel}
            personnelOptions={personnelOptions}
            openPersonnelSelector={openPersonnelSelector}
            setOpenPersonnelSelector={setOpenPersonnelSelector}
            onAddShop={handleAddShop}
            isLoading={isLoading}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <GoalSettingTable
              monthlyShopTotals={monthlyShopTotals}
              onEditShop={handleEditShop}
              onSaveGoals={handleSaveGoals}
              isSaving={updateReportMutation.isPending}
              editingShopId={editingShopId}
              setEditingShopId={setEditingShopId}
            />
          )}
        </CardContent>
      </Card>
      <ShopDialog
        open={isShopDialogOpen}
        onOpenChange={setIsShopDialogOpen}
        shop={editingShop}
      />
    </div>
  );
});

GoalSettingPage.displayName = "GoalSettingPage";

export default GoalSettingPage;