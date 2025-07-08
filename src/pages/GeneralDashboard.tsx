
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Wrench, Palette, Plus, RefreshCw, Bug } from 'lucide-react';

interface UpdateItem {
  id: string;
  type: 'cải tiến' | 'thiết kế lại' | 'tính năng mới' | 'cập nhật' | 'sửa lỗi';
  title: string;
  description: string;
  date: string;
  version: string;
}

const mockUpdates: UpdateItem[] = [
  {
    id: '1',
    type: 'cải tiến',
    title: 'Tích hợp người dùng Google hoàn chỉnh',
    description: 'Nâng cấp hệ thống đăng nhập để chi sử dụng Google, loại bỏ đăng ký bằng email/mật khẩu để đơn giản hóa trải nghiệm đăng nhập.',
    date: '2025-05-22',
    version: '1.5.1'
  },
  {
    id: '2', 
    type: 'thiết kế lại',
    title: 'Cải thiện giao diện công cụ hình ảnh',
    description: 'Thiết kế lại giao diện các công cụ liên quan đến hình ảnh (Ideogram, Image GPT, Image Edit) để trực quan và thông nhất hơn, giúp người dùng dễ dàng sử dụng.',
    date: '2025-05-21',
    version: '1.5.0'
  },
  {
    id: '3',
    type: 'cải tiến', 
    title: 'Cải thiện QR thanh toán và hiển thị dữ liệu thực',
    description: 'Nâng cấp kích thước QR code thanh toán, tối ưu mã giao dịch với email và số thứ tự, hiển thị số liệu thống kê thực từ cơ sở dữ liệu.',
    date: '2025-05-21',
    version: '1.4.0'
  }
];

const getTypeIcon = (type: UpdateItem['type']) => {
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

const getTypeColor = (type: UpdateItem['type']) => {
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cập nhật hệ thống</h1>
          <p className="text-gray-600 mt-2">Các thay đổi và cập nhật mới nhất</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Xem tất cả
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Cập nhật hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockUpdates.map((update, index) => (
              <div key={update.id} className="relative">
                {index < mockUpdates.length - 1 && (
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
                      <span className="text-sm text-gray-500">{update.date}</span>
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
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Button variant="ghost" className="text-gray-500">
              Xem tất cả (10)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralDashboard;
