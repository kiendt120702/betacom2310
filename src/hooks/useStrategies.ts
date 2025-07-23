import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Strategy {
  id: string;
  title: string;
  category: string;
  target_audience: string;
  objective: string;
  strategy_steps: string[];
  benefits: string[];
  kpis: string[];
  explanation: string;
  context_info?: string;
  tags: string[];
  difficulty_level: number;
  estimated_time?: string;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface StrategyCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface StrategyIndustry {
  id: string;
  name: string;
  description?: string;
}

// Sample data based on your table structure
const sampleStrategies: Strategy[] = [
  {
    id: '1',
    title: 'Từ 1 sản phẩm → Đánh thêm 1 ngách mới (Đại nam/Đại nữ) hoặc (Sữa tắm 3in1/8in1)',
    category: 'A1',
    target_audience: 'Tất cả ngành hàng',
    objective: 'Mở rộng ngách sản phẩm',
    strategy_steps: [
      'Từ 1 sản phẩm → Đánh thêm 1 ngách mới (Đại nam/Đại nữ)',
      'Đại bánh Giáng sinh: Crinkle, Tiramisu',
      'Dịp lễ/tết: Bộ quà tặng Sữa tắm gội cho bạn trai',
      'Đại đi biển mua hè: Váy, Jumpsuit,...'
    ],
    benefits: ['Tăng doanh thu', 'Giảm rủi ro', 'Mở rộng khách hàng'],
    kpis: ['Doanh thu', 'Số sản phẩm mới', 'Tỷ lệ chuyển đổi'],
    explanation: 'Mở rộng ngách sản phẩm từ 1 sản phẩm ban đầu',
    tags: ['mở rộng', 'đa dạng hóa'],
    difficulty_level: 2,
    estimated_time: '2-3 tháng',
    success_rate: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: '- Đại bánh Giáng sinh: Crinkle, Tiramisu\n- Dịp lễ/tết: Bộ quà tặng Sữa tắm gội cho bạn trai\n- Đại đi biển mua hè: Váy, Jumpsuit,...',
    category: 'A1',
    target_audience: 'Tất cả ngành hàng', // Updated to 'Tất cả ngành hàng'
    objective: 'Đẩy đại sản phẩm mùa vụ',
    strategy_steps: [
      'Chọn sản phẩm theo mùa vụ phù hợp',
      'Tạo campaign marketing đặc biệt',
      'Thiết kế combo sản phẩm hấp dẫn',
      'Chạy quảng cáo tập trung'
    ],
    benefits: ['Tăng doanh thu theo mùa', 'Tạo buzz marketing'],
    kpis: ['Doanh thu campaign', 'Lượt tương tác'],
    explanation: 'Tận dụng các dịp lễ tết để đẩy sản phẩm',
    tags: ['mùa vụ', 'campaign'],
    difficulty_level: 3,
    estimated_time: '1-2 tháng',
    success_rate: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Để xuất khách đăng post, chay campaign, gắn link trên website',
    category: 'A1',
    target_audience: 'Tất cả ngành hàng',
    objective: 'Kéo traffic ngoài sàn',
    strategy_steps: [
      'Tạo nội dung hấp dẫn cho khách hàng',
      'Khuyến khích khách đăng bài review',
      'Tạo campaign UGC (User Generated Content)',
      'Đặt link website trong các bài đăng'
    ],
    benefits: ['Tăng traffic tự nhiên', 'Xây dựng cộng đồng'],
    kpis: ['Số lượt click', 'Engagement rate'],
    explanation: 'Sử dụng sức mạnh của cộng đồng để tăng traffic',
    tags: ['UGC', 'community', 'traffic'],
    difficulty_level: 2,
    estimated_time: '1-2 tháng',
    success_rate: 82,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: '- Chuỗi cửa hàng/Số lượng đối tác/... làm thành ảnh phụ thứ 2 và banner\n- Các KOL/KOC hợp tác với thương hiệu',
    category: 'A1',
    target_audience: 'Tất cả ngành hàng', // Updated to 'Tất cả ngành hàng'
    objective: 'Truyền thông về thương hiệu',
    strategy_steps: [
      'Tạo hình ảnh thể hiện quy mô chuỗi cửa hàng',
      'Hợp tác với KOL/KOC uy tín',
      'Thiết kế banner chuyên nghiệp',
      'Đăng tải thông tin đối tác'
    ],
    benefits: ['Tăng độ tin cậy', 'Nâng cao thương hiệu'],
    kpis: ['Brand awareness', 'Trust score'],
    explanation: 'Sử dụng uy tín và quy mô để xây dựng thương hiệu',
    tags: ['branding', 'partnership', 'KOL'],
    difficulty_level: 4,
    estimated_time: '3-6 tháng',
    success_rate: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: '- Truyền thông về số lượng quá có giới hạn\n- Chương trình giá chạy trong khoảng thời gian giới hạn',
    category: 'A1',
    target_audience: 'Tất cả ngành hàng',
    objective: 'Tạo sự khan hiếm',
    strategy_steps: [
      'Tạo thông điệp về số lượng có hạn',
      'Thiết lập thời gian khuyến mãi giới hạn',
      'Sử dụng countdown timer',
      'Nhấn mạnh tính khan hiếm trong mô tả'
    ],
    benefits: ['Tăng tỷ lệ chuyển đổi', 'Tạo cảm giác cấp bách'],
    kpis: ['Conversion rate', 'Sales velocity'],
    explanation: 'Tận dụng tâm lý FOMO để thúc đẩy mua hàng',
    tags: ['scarcity', 'urgency', 'FOMO'],
    difficulty_level: 3,
    estimated_time: '2-4 tuần',
    success_rate: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sampleCategories: StrategyCategory[] = [
  {
    id: '1',
    name: 'Công thức A1',
    description: 'Các bước cụ thể phải làm',
    color: '#FF6B35',
    icon: 'list-checks'
  },
  {
    id: '2',
    name: 'Công thức A',
    description: 'Mục đích của việc làm đó',
    color: '#4ECDC4',
    icon: 'target'
  },
  {
    id: '3',
    name: 'Ngành hàng áp dụng',
    description: 'Áp dụng cho shop bán gì',
    color: '#45B7D1',
    icon: 'briefcase'
  }
];

const sampleIndustries: StrategyIndustry[] = [
  {
    id: '1',
    name: 'Tất cả ngành hàng',
    description: 'Áp dụng được cho mọi loại sản phẩm'
  },
  {
    id: '2',
    name: 'Thời trang',
    description: 'Quần áo, phụ kiện thời trang'
  },
  {
    id: '3',
    name: 'Sắc đẹp',
    description: 'Mỹ phẩm, chăm sóc cá nhân'
  },
  {
    id: '4',
    name: 'Gia dụng',
    description: 'Đồ dùng trong nhà'
  }
];

export const useStrategies = () => {
  const { data: strategies = sampleStrategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['shopee_strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_strategies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching strategies:', error);
        return sampleStrategies;
      }
      
      return data.length > 0 ? data : sampleStrategies;
    },
  });

  const { data: categories = sampleCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['strategy-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return sampleCategories;
      }
      
      return data.length > 0 ? data : sampleCategories;
    },
  });

  const { data: industries = sampleIndustries, isLoading: industriesLoading } = useQuery({
    queryKey: ['strategy-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_industries')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching industries:', error);
        return sampleIndustries;
      }
      
      return data.length > 0 ? data : sampleIndustries;
    },
  });

  return {
    strategies,
    categories,
    industries,
    isLoading: strategiesLoading || categoriesLoading || industriesLoading,
  };
};