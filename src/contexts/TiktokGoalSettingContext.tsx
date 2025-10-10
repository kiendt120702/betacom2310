import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTiktokComprehensiveReportData } from '@/hooks/useTiktokComprehensiveReportData';
import { useUpdateTiktokGoals } from '@/hooks/useTiktokComprehensiveReports';
import { useTiktokShops, useUsersForAssignment, useTiktokShopMutations, useTiktokShopForm } from "@/hooks/useTiktokShops";
import { generateMonthOptions } from '@/utils/revenueUtils';
import { toast } from "sonner";
import { TiktokShop } from "@/types/tiktokShop";
import { format } from "date-fns";
import { UseMutationResult } from '@tanstack/react-query';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

interface Employee { id: string; name: string; }
interface MonthOption { value: string; label: string; }

interface TiktokGoalSettingContextType {
  isLoading: boolean;
  monthlyShopTotals: any[];
  leaders: Employee[];
  personnelOptions: Employee[];
  monthOptions: MonthOption[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedPersonnel: string;
  setSelectedPersonnel: (personnel: string) => void;
  openPersonnelSelector: boolean;
  setOpenPersonnelSelector: (open: boolean) => void;
  updateGoalsMutation: ReturnType<typeof useUpdateTiktokGoals>;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  openCreateDialog: () => void;
  openEditDialog: (shop: TiktokShop) => void;
  closeCreateDialog: () => void;
  closeEditDialog: () => void;
  handleCreateShopSubmit: () => void;
  handleEditShopSubmit: () => void;
  formData: any;
  setFormData: (data: any) => void;
  users: any[];
  createShop: UseMutationResult<any, Error, TablesInsert<'tiktok_shops'>, unknown>;
  updateShop: UseMutationResult<any, Error, { id: string; shopData: TablesUpdate<'tiktok_shops'>; }, unknown>;
}

const TiktokGoalSettingContext = createContext<TiktokGoalSettingContextType | undefined>(undefined);

export const TiktokGoalSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useTiktokComprehensiveReportData({
    selectedMonth,
    selectedLeader: "all",
    selectedPersonnel,
    debouncedSearchTerm: "",
    sortConfig: null,
  });

  const updateGoalsMutation = useUpdateTiktokGoals();
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: users = [] } = useUsersForAssignment();
  const { createShop, updateShop } = useTiktokShopMutations();
  const {
    formData,
    setFormData,
    selectedShop: editingShopTiktok,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
  } = useTiktokShopForm();

  const handleCreateShopSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }
    createShop.mutate(formData, { onSuccess: closeCreateDialog });
  };

  const handleEditShopSubmit = () => {
    if (!editingShopTiktok || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }
    updateShop.mutate({ id: editingShopTiktok.id, shopData: formData }, { onSuccess: closeEditDialog });
  };

  const openCreateDialog = () => setIsCreateDialogOpen(true);

  const contextValue = useMemo((): TiktokGoalSettingContextType => ({
    isLoading,
    monthlyShopTotals,
    leaders,
    personnelOptions,
    monthOptions,
    selectedMonth,
    setSelectedMonth,
    selectedPersonnel,
    setSelectedPersonnel,
    openPersonnelSelector,
    setOpenPersonnelSelector,
    updateGoalsMutation,
    isCreateDialogOpen,
    isEditDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    handleCreateShopSubmit,
    handleEditShopSubmit,
    formData,
    setFormData,
    users,
    createShop,
    updateShop,
  }), [
    isLoading, monthlyShopTotals, leaders, personnelOptions, monthOptions,
    selectedMonth, selectedPersonnel, openPersonnelSelector, updateGoalsMutation,
    isCreateDialogOpen, isEditDialogOpen, formData, users, editingShopTiktok, createShop, updateShop,
    openEditDialog, closeCreateDialog, closeEditDialog
  ]);

  return (
    <TiktokGoalSettingContext.Provider value={contextValue}>
      {children}
    </TiktokGoalSettingContext.Provider>
  );
};

export const useTiktokGoalSettingContext = (): TiktokGoalSettingContextType => {
  const context = useContext(TiktokGoalSettingContext);
  if (!context) {
    throw new Error('useTiktokGoalSettingContext must be used within a TiktokGoalSettingProvider');
  }
  return context;
};