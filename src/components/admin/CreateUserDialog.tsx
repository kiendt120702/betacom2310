import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CreateUserForm from "./CreateUserForm";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleError = (error: unknown) => {
    console.error("Create user error:", error);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo người dùng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo tài khoản mới cho nhân viên.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;