import React from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from 'src/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, MessageCircle, Search, HelpCircle, Settings } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();

  const isAdmin = userProfile?.role === 'admin';
  const isLeader = userProfile?.role === 'leader';

  const features = [
    { 
      name: 'Quản lý Thumbnail', 
      description: 'Quản lý các hình ảnh hiển thị trên trang chủ và các chiến dịch.', 
      icon: LayoutGrid, 
      path: '/thumbnail', 
      available: true 
    },
    { 
      name: 'Đăng Nhanh Sản Phẩm', 
      description: 'Công cụ hỗ trợ đăng sản phẩm lên sàn thương mại điện tử một cách nhanh chóng.', 
      icon: Package, 
      path: '/quick-post', 
      available: true 
    },
    { 
      name: 'Tư vấn AI', 
      description: 'Nhận tư vấn chiến lược bán hàng và tối ưu shop từ AI chuyên gia.', 
      icon: MessageCircle, 
      path: '/chatbot', 
      available: true 
    },
    { 
      name: 'SEO Shopee', 
      description: 'Tối ưu tên và mô tả sản phẩm chuẩn SEO Shopee với sự hỗ trợ của AI.', 
      icon: Search, 
      path: '/seo-chatbot', 
      available: true 
    },
    { 
      name: 'Hỏi đáp chung', 
      description: 'Trợ lý AI giải đáp mọi thắc mắc về kinh doanh, marketing và các vấn đề khác.', 
      icon: HelpCircle, 
      path: '/general-chatbot', 
      available: true 
    },
    { 
      name: 'Management', 
      description: 'Quản lý người dùng, kiến thức và các cài đặt hệ thống.', 
      icon: Settings, 
      path: '/management', 
      available: isAdmin || isLeader 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Chào mừng đến với <span className="text-primary">Betacom</span>
          </h1>
          {/* Removed the description paragraph */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {features.map((feature, index) => feature.available && (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h2>
              <p className="text-gray-600 text-sm flex-1 mb-4">{feature.description}</p>
              <Button 
                onClick={() => navigate(feature.path)} 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Truy cập
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;