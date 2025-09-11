import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Plus } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useTiktokShops, useUsersForAssignment, useTiktokShopMutations, useTiktokShopForm } from "@/hooks/useTiktokShops";
import { useTiktokShopFilters } from "@/hooks/useTiktokShopFilters";
import { TiktokShopFilters } from "@/components/tiktok-shops/TiktokShopFilters";
import { TiktokShopList } from "@/components/tiktok-shops/TiktokShopList";
import { CreateShopDialog, EditShopDialog } from "@/components/tiktok-shops/TiktokShopDialogs";
import { toast } from "sonner";

/**
 * TikTok Shop Management Page Component
 * Manages TikTok shops with CRUD operations
 */
const TiktokShopManagementPage = () => {
  const { data: currentUser } = useUserProfile();
  const { isAdmin } = useUserPermissions(currentUser || undefined);

  // Data fetching hooks
  const { data: shops = [], isLoading } = useTiktokShops();
  const { data: users = [] } = useUsersForAssignment();

  // Form management hook
  const {
    formData,
    setFormData,
    selectedShop,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
  } = useTiktokShopForm();

  // Filtering hook
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filteredShops,
  } = useTiktokShopFilters(shops);

  // Mutation hooks
  const { createShop, updateShop, deleteShop } = useTiktokShopMutations();

  // Handle form submissions
  const handleCreateShop = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }

    createShop.mutate(formData, {
      onSuccess: () => {
        closeCreateDialog();
      },
    });
  };

  const handleEditShop = () => {
    if (!selectedShop || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên shop!");
      return;
    }

    updateShop.mutate(
      { id: selectedShop.id, shopData: formData },
      {
        onSuccess: () => {
          closeEditDialog();
        },
      }
    );
  };

  const handleDeleteShop = (shop: any) => {
    deleteShop.mutate(shop.id);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Shop TikTok</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý danh sách các shop TikTok và phân công nhân sự
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Shop
        </Button>
      </div>

      {/* Filters Component */}
      <TiktokShopFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Shops List Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Danh Sách Shop ({filteredShops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TiktokShopList
            shops={filteredShops}
            onEdit={openEditDialog}
            onDelete={handleDeleteShop}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Shop Dialog */}
      <CreateShopDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        formData={formData}
        setFormData={setFormData}
        users={users}
        onSubmit={handleCreateShop}
        isSubmitting={createShop.isPending}
      />

      {/* Edit Shop Dialog */}
      <EditShopDialog
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        formData={formData}
        setFormData={setFormData}
        users={users}
        onSubmit={handleEditShop}
        isSubmitting={updateShop.isPending}
      />
    </div>
  );
};

export default TiktokShopManagementPage;