import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBanners } from '@/hooks/useBanners';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const BannerGallery: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = useBanners({
    page: 1,
    pageSize: 100,          // fetch up to 100 thumbnails
    searchTerm: '',
    selectedCategory: 'all',
    selectedType: 'all',
    sortBy: 'created_at_desc',
  });

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải ảnh...</div>;
  }
  if (error) {
    toast({
      title: "Lỗi tải dữ liệu",
      description: "Không thể lấy danh sách thumbnail.",
      variant: "destructive",
    });
    return <div className="p-8 text-center text-destructive">Có lỗi xảy ra</div>;
  }

  const banners = data?.banners || [];

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {banners.map(b => (
          <div key={b.id} className="border rounded overflow-hidden">
            <img
              src={b.image_url}
              alt={b.name}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => navigate(`/thumbnail/${b.id}`)}
            />
            <div className="p-2 text-sm truncate">{b.name}</div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            Chưa có thumbnail nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerGallery;