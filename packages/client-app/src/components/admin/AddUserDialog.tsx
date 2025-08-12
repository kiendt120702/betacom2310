import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateUserForm from "./CreateUserForm";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { UserProfile } from "@/hooks/useUserProfile";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (options?: RefetchOptions) => Promise<QueryObserverResult<UserProfile[], Error>>;
  children?: React.ReactNode; // Add children prop here
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onOpenChange, onSuccess, children }) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess(); // Call the passed onSuccess prop
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || ( // Thêm nút mặc định nếu không có children
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6 py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        )}
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