import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TiktokShopForm } from "./TiktokShopForm";
import type { TiktokShopFormData, User } from "@/types/tiktokShop";

interface CreateShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TiktokShopFormData;
  setFormData: (data: TiktokShopFormData) => void;
  users: User[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

interface EditShopDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TiktokShopFormData;
  setFormData: (data: TiktokShopFormData) => void;
  users: User[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CreateShopDialog: React.FC<CreateShopDialogProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  users,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Shop TikTok Mới</DialogTitle>
        </DialogHeader>
        <TiktokShopForm
          formData={formData}
          setFormData={setFormData}
          users={users}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export const EditShopDialog: React.FC<EditShopDialogProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  users,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Shop TikTok</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin shop và phân công nhân sự
          </DialogDescription>
        </DialogHeader>
        <TiktokShopForm
          formData={formData}
          setFormData={setFormData}
          users={users}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  );
};