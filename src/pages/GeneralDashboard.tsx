import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Wrench, Palette, Plus, RefreshCw, Bug, Loader2 } from 'lucide-react';
import { useSystemUpdates } from '@/hooks/useSystemUpdates';
import { AddUpdateDialog } from '@/components/admin/AddUpdateDialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'cải tiến':
      return <Wrench className="w-4 h-4" />;
    case 'thiết kế lại':
      return <Palette className="w-4 h-4" />;
    case 'tính năng mới':
      return <Plus className="w-4 h-4" />;
    case 'cập nhật':
      return <RefreshCw className="w-4 h-4" />;
    case 'sửa lỗi':
      return <Bug className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'cải tiến':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'thiết kế lại':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    case 'tính năng mới':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'cập nhật':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    case 'sửa lỗi':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

const GeneralDashboard: React.FC = () => {
  const { data: updates, isLoading, error } = useSystemUpdates();
  const { data: userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        Có lỗi xảy ra khi tải dữ liệu cập nhật hệ thống
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cập nhật hệ thống</h1>
          <p className="text-muted-foreground mt-2">Các thay đổi và cập nhật mới nhất</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <AddUpdateDialog />}
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Xem tất cả
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Cập nhật hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!updates || updates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có cập nhật hệ thống nào</p>
              {isAdmin && (
                <p className="text-sm mt-2">Sử dụng nút "Thêm cập nhật" để thêm cập nhật mới</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update, index) => (
                <div key={update.id} className="relative">
                  {index < updates.length - 1 && (
                    <div className="absolute left-2 top-16 w-px h-16 bg-border"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-1 h-8 bg-muted rounded-full mt-1"></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getTypeColor(update.type)}`}
                        >
                          {update.type}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {update.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {update.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(update.created_at), 'yyyy-MM-dd', { locale: vi })}
                      </div>
                      <div className="text-sm font-mono text-foreground mt-1">
                        {update.version}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {updates && updates.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <Button variant="ghost" className="text-muted-foreground">
                Xem tất cả ({updates.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralDashboard;