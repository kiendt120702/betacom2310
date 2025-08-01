import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast'; // Re-import ToastAction

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    defaultTitle: 'Thành công',
    className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Lỗi',
    className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: 'Cảnh báo',
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50',
  },
  info: {
    icon: Info,
    defaultTitle: 'Thông tin',
    className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50',
  },
} as const;

export const useToastNotifications = () => {
  const { toast } = useToast();

  const showToast = (variant: ToastVariant, options: ToastOptions = {}) => {
    const config = toastConfig[variant];
    // const Icon = config.icon; // Icon is not used in the current toast call, but kept for potential future use.

    // Define the action component separately to avoid complex inline JSX issues
    const toastActionComponent = options.action ? (
      <ToastAction onClick={options.action.onClick}>
        {options.action.label}
      </ToastAction>
    ) : undefined;

    toast({
      title: options.title || config.defaultTitle,
      description: options.description,
      duration: options.duration || 5000,
      className: config.className,
      action: toastActionComponent, // Pass the defined component here
    });
  };

  // Convenience methods - these must be inside the hook to access showToast
  const success = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { description: options } : options;
    showToast('success', opts);
  };

  const error = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { description: options } : options;
    showToast('error', opts);
  };

  const warning = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { description: options } : options;
    showToast('warning', opts);
  };

  const info = (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { description: options } : options;
    showToast('info', opts);
  };

  // Common toast patterns
  const saveSuccess = (itemName?: string) => {
    success(`${itemName ? itemName : 'Dữ liệu'} đã được lưu thành công!`);
  };

  const deleteSuccess = (itemName?: string) => {
    success(`${itemName ? itemName : 'Mục'} đã được xóa thành công!`);
  };

  const uploadSuccess = (fileName?: string) => {
    success(`${fileName ? fileName : 'File'} đã được upload thành công!`);
  };

  const networkError = () => {
    error({
      title: 'Lỗi kết nối',
      description: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
    });
  };

  const validationError = (message?: string) => {
    warning({
      title: 'Dữ liệu không hợp lệ',
      description: message || 'Vui lòng kiểm tra lại thông tin đã nhập.',
    });
  };

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    warning({
      title: 'Xác nhận xóa',
      description: `Bạn có chắc chắn muốn xóa ${itemName}?`,
      action: {
        label: 'Xóa',
        onClick: onConfirm,
      },
    });
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    // Common patterns
    saveSuccess,
    deleteSuccess,
    uploadSuccess,
    networkError,
    validationError,
    confirmDelete,
  };
};