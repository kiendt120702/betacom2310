import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";

const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { key: "Ctrl + F", description: "Tìm kiếm thumbnail" },
    { key: "Ctrl + N", description: "Thêm thumbnail mới" },
    { key: "←", description: "Trang trước" },
    { key: "→", description: "Trang sau" },
    { key: "Home", description: "Trang đầu" },
    { key: "End", description: "Trang cuối" },
    { key: "?", description: "Hiển thị trợ giúp phím tắt" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm"
          title="Phím tắt (Ctrl + ?)"
        >
          <Keyboard className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Phím tắt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-4">
          Nhấn <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 rounded">Esc</kbd> để đóng
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;