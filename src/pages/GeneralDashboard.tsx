import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

const GeneralDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">Chào mừng đến với Dashboard của Betacom!</CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                Đây là nơi tổng quan về các công cụ và tính năng mạnh mẽ của hệ thống Betacom, giúp bạn tối ưu hóa hoạt động kinh doanh trên Shopee.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Hệ thống Betacom được thiết kế để hỗ trợ toàn diện cho các nhà bán hàng trên Shopee, từ việc quản lý hình ảnh sản phẩm, đăng tải sản phẩm nhanh chóng, cho đến việc tối ưu hóa SEO và nhận tư vấn chiến lược từ AI.
          </p>
          <p>
            Với các công cụ như **Quản lý Thumbnail**, **Đăng Nhanh Sản Phẩm**, và các chatbot AI chuyên sâu về **Tư vấn chiến lược**, **SEO Shopee**, và **Hỏi đáp chung**, chúng tôi cam kết mang lại hiệu quả cao nhất cho hoạt động kinh doanh của bạn.
          </p>
          <p>
            Hãy khám phá các tính năng trong sidebar để bắt đầu hành trình tối ưu hóa cùng Betacom!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralDashboard;