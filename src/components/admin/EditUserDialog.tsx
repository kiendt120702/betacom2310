import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser, useUsers } from "@/hooks/useUsers";
import { UserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { useTeams } from "@/hooks/useTeams";
import { Loader2 } from "lucide-react";
import { secureLog } from "@/lib/utils";
import EditUserForm from "./EditUserForm"; // Import the new form component

interface EditUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelfEdit?: boolean;
  onSuccess?: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  isSelfEdit = false,
  onSuccess,
}) => {
  const { data: currentUser } = useUserProfile();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: allUsersData, isLoading: allUsersLoading } = useUsers({
    page: 1,
    pageSize: 1000,
    searchTerm: "",
    selectedRole: "all",
    selectedTeam: "all",
    selectedManager: "all",
  });
  const allUsers = allUsersData?.users || [];

  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();

  const isSubmitting = updateUserMutation.isPending;

  const handleSave = async (formData: any) => { // Use 'any' for now, as EditUserForm will handle Zod validation
    if (!user || !currentUser) return;

    try {
      const updateData = {
        id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        team_id: formData.team_id,
        work_type: formData.work_type,
        manager_id: formData.manager_id,
      };

      secureLog("Submitting update for user:", updateData);

      await updateUserMutation.mutateAsync(updateData);

      toast({
        title: "Thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error: unknown) {
      secureLog("Error updating user:", error);
      toast({
        title: "Lỗi",
        description:
          (error instanceof Error ? error.message : String(error)) ||
          "Không thể cập nhật thông tin người dùng.",
        variant: "destructive",
      });
    }
  };

  if (!user || !currentUser) return null;

  const isLoading = teamsLoading || allUsersLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isSelfEdit ? "Chỉnh sửa hồ sơ" : "Chỉnh sửa người dùng"}
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết cho người dùng.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <EditUserForm
            user={user}
            currentUser={currentUser}
            teams={teams}
            allUsers={allUsers}
            isSubmitting={isSubmitting}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
            isSelfEdit={isSelfEdit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;