import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateUserForm from "./CreateUserForm";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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
          <DialogDescription>
            Điền thông tin để tạo tài khoản mới cho nhân viên.
          </DialogDescription>
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
