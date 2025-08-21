import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useContentProtection = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Chức năng bị vô hiệu hóa",
        description: "Bạn không thể thực hiện hành động này.",
        variant: "destructive",
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        toast({
          title: "Chức năng bị vô hiệu hóa",
          description: "Developer tools đã bị tắt.",
          variant: "destructive",
        });
        return false;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        toast({
          title: "Chức năng bị vô hiệu hóa",
          description: "Developer tools đã bị tắt.",
          variant: "destructive",
        });
        return false;
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        toast({
          title: "Chức năng bị vô hiệu hóa",
          description: "Không thể xem nguồn trang.",
          variant: "destructive",
        });
        return false;
      }
      
      // Block Ctrl+S (Save)
      if (e.ctrlKey && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        toast({
          title: "Chức năng bị vô hiệu hóa",
          description: "Không thể lưu trang.",
          variant: "destructive",
        });
        return false;
      }
      
      // Block Ctrl+C (Copy) - just show a toast, as preventing it completely can be tricky
      if (e.ctrlKey && e.key.toUpperCase() === 'C') {
        toast({
          title: "Chức năng bị vô hiệu hóa",
          description: "Không thể sao chép nội dung.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
      (document.body.style as any).webkitUserSelect = 'auto';
    };
  }, [toast]);
};