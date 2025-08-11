
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateUserForm from "./CreateUserForm";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
        </DialogHeader>
        <CreateUserForm 
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
