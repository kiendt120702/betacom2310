import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Package, Trash2, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface ProductSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  products: any[];
}

interface ProductSidebarProps {
  sessions: ProductSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onSaveCurrentSession: () => void;
  hasUnsavedChanges: boolean;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onSaveCurrentSession,
  hasUnsavedChanges,
}) => {
  const { toast } = useToast();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleStartEdit = (session: ProductSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (editingSessionId && editingTitle.trim()) {
      onRenameSession(editingSessionId, editingTitle.trim());
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-64 bg-background text-foreground flex flex-col h-full border-r border-border flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-2">
        <Button
          onClick={onNewSession}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Phiên làm việc mới
        </Button>
        
        {hasUnsavedChanges && (
          <Button
            onClick={onSaveCurrentSession}
            variant="outline"
            size="sm"
            className="w-full text-xs flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Save className="w-3 h-3" />
            Lưu thay đổi
          </Button>
        )}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-muted-foreground text-sm p-6 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-base mb-2 text-foreground">Chưa có phiên làm việc</div>
                <div className="text-xs opacity-70">Tạo phiên làm việc đầu tiên của bạn!</div>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                    selectedSessionId === session.id
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-5 h-5 flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-6 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(e);
                              if (e.key === 'Escape') handleCancelEdit(e);
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={handleSaveEdit}
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium leading-5 truncate">
                            {session.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.products.length} sản phẩm • {formatDate(session.updated_at)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  {editingSessionId !== session.id && (
                    <div className={cn(
                      "flex items-center gap-1 transition-opacity duration-200",
                      selectedSessionId === session.id 
                        ? "opacity-100" 
                        : "opacity-0 group-hover:opacity-100"
                    )}>
                      <button
                        onClick={(e) => handleStartEdit(session, e)}
                        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
                        title="Đổi tên phiên làm việc"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-blue-600" />
                      </button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Xóa phiên làm việc"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa phiên làm việc</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa phiên làm việc "{session.title}" với {session.products.length} sản phẩm? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProductSidebar;