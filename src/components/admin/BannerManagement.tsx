import React, { useState } from 'react';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean; // Keep active property in interface as it still exists in DB
  order: number;
  createdAt: string;
}

interface BannerManagementProps {
  currentUser: {
    role: string;
  };
}

const BannerManagement: React.FC<BannerManagementProps> = ({ currentUser }) => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: 'Khuyến mãi đặc biệt',
      description: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=200&fit=crop',
      link: '#',
      active: true,
      order: 1,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Sản phẩm mới 2024',
      description: 'Khám phá bộ sưu tập mới nhất của chúng tôi',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop',
      link: '#',
      active: true,
      order: 2,
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      title: 'Công nghệ tiên tiến',
      description: 'Trải nghiệm công nghệ đỉnh cao',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
      link: '#',
      active: false,
      order: 3,
      createdAt: '2024-01-05'
    }
  ]);

  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  const deleteBanner = (id: number) => {
    if (!canEdit) {
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền xóa banner",
        variant: "destructive",
      });
      return;
    }

    setBanners(banners.filter(banner => banner.id !== id));
    toast({
      title: "Xóa thành công",
      description: "Banner đã được xóa",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Banner</h2>
          <p className="text-gray-600 mt-2">Quản lý banner hiển thị trên trang chủ</p>
        </div>
        {canEdit && (
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Banner
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="flex">
              <div className="w-48 h-32 bg-gray-200 flex-shrink-0">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{banner.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{banner.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Thứ tự: {banner.order}</span>
                      <span>Tạo: {banner.createdAt}</span>
                      <a href={banner.link} className="text-blue-600 hover:underline">
                        {banner.link}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <GripVertical className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBanner(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">Chưa có banner nào</h3>
            <p className="mb-4">Thêm banner đầu tiên để bắt đầu</p>
            {canEdit && (
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Banner
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BannerManagement;