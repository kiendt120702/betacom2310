import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useUsers';
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateUserForm from './CreateUserForm';

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ onUserCreated }) => {
  const { toast } = useToast();
  const { data: currentUser } = useUserProfile();
  const createUserMutation = useCreateUser();
  const [open, setOpen] = useState(false);

  const handleUserCreated = () => {
    toast({
      title: "Thành công",
      description: "Tạo người dùng mới thành công",
      className: "bg-green-50 border-green-200 text-green-800",
    });
    setOpen(false);
    onUserCreated();
  };

  const handleError = (error: any) => {
    console.error('Error creating user:', error);
    toast({
      title: "Lỗi",
      description: error.message || "Không thể tạo người dùng mới",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-primary hover:bg-primary/5 border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3">
          <UserPlus className="w-5 h-5 mr-2" />
          Thêm Người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            Tạo người dùng mới
          </DialogTitle>
        </DialogHeader>
        <div className="pt-6">
          <CreateUserForm
            currentUser={currentUser}
            createUserMutation={createUserMutation}
            onSuccess={handleUserCreated}
            onError={handleError}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;