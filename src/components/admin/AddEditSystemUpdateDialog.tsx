import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SystemUpdateForm from './SystemUpdateForm';
import { SystemUpdate } from '@/hooks/useSystemUpdates';

interface AddEditSystemUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SystemUpdate | null;
  onSuccess: () => void;
}

const AddEditSystemUpdateDialog: React.FC<AddEditSystemUpdateDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Chỉnh sửa bản cập nhật' : 'Thêm bản cập nhật mới'}</DialogTitle>
        </DialogHeader>
        <SystemUpdateForm
          initialData={initialData}
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEditSystemUpdateDialog;