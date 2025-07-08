
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
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'thiết kế lại':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'tính năng mới':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cập nhật':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'sửa lỗi':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const GeneralDashboard: React.FC = () => {
  const { data: updates, isLoading, error } = useSystemUpdates();
  const { data: userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        Có lỗi xảy ra khi tải dữ liệu cập nhật hệ thống
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cập nhật hệ thống</h1>
          <p className="text-gray-600 mt-2">Các thay đổi và cập nhật mới nhất</p>
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
            <div className="text-center py-8 text-gray-500">
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
                    <div className="absolute left-6 top-12 w-px h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(update.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getTypeColor(update.type)}`}
                        >
                          {update.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(update.created_at), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                        <span className="text-sm font-mono text-gray-600">{update.version}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {update.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {update.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {updates && updates.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Button variant="ghost" className="text-gray-500">
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
