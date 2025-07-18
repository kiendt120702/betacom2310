
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Strategy {
  id: string;
  title: string;
  category: string;
  industry: string;
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

// Sample data for demonstration
const sampleStrategies: Strategy[] = [
  {
    id: '1',
    title: 'Từ 1 sản phẩm → Đánh thêm 1 ngách mới',
    category: 'Công thức A1',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Seller mới bắt đầu',
    objective: 'Mở rộng danh mục sản phẩm từ 1 sản phẩm thành nhiều ngách',
    strategy_steps: [
      'Từ 1 sản phẩm → Đánh thêm 1 ngách mới (Đại nam/Đại nữ)',
      'Đại bánh Giáng sinh: Crinkle, Tiramisu',
      'Dịp lễ/tết: Bộ quà tặng Sữa tắm gội cho bạn trai',
      'Đại đi biển mua hè: Váy, Jumpsuit,...',
      'Để xuất khách đăng post, chạy campaign, gắn link trên website'
    ],
    benefits: [
      'Tăng doanh thu từ nhiều sản phẩm',
      'Giảm rủi ro phụ thuộc vào 1 sản phẩm',
      'Mở rộng thị trường khách hàng',
      'Tận dụng được traffic hiện có'
    ],
    kpis: [
      'Số lượng sản phẩm mới',
      'Doanh thu từ sản phẩm mới',
      'Tỷ lệ chuyển đổi',
      'Chi phí marketing trên mỗi đơn hàng'
    ],
    explanation: 'Chiến lược này giúp seller mở rộng từ 1 sản phẩm ban đầu thành nhiều sản phẩm trong các ngách khác nhau, tạo sự đa dạng và giảm rủi ro kinh doanh. Bằng cách tận dụng khách hàng hiện có và mở rộng sang các sản phẩm liên quan.',
    tags: ['mở rộng', 'đa dạng hóa', 'tăng trưởng'],
    difficulty_level: 2,
    estimated_time: '2-3 tháng',
    success_rate: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Mở rộng ngành sản phẩm',
    category: 'Công thức A',
    industry: 'Thực phẩm đồ uống/Sắc đẹp',
    target_audience: 'Seller có kinh nghiệm',
    objective: 'Phát triển và mở rộng các ngành hàng mới từ cơ sở hiện có',
    strategy_steps: [
      'Đẩy đại sản phẩm mùa vụ',
      'Kéo traffic ngoài sàn',
      'Truyền thông về thương hiệu',
      'Tạo sự khan hiếm',
      'Chuỗi cửa hàng/Số lượng đối tác làm thành ảnh phụ thứ 2 và banner'
    ],
    benefits: [
      'Tăng doanh thu theo mùa',
      'Tận dụng xu hướng tiêu dùng',
      'Tạo buzz marketing hiệu quả',
      'Xây dựng thương hiệu mạnh'
    ],
    kpis: [
      'Doanh thu trong campaign',
      'Lượt tương tác',
      'Chi phí quảng cáo',
      'Tỷ lệ nhận diện thương hiệu'
    ],
    explanation: 'Chiến lược tập trung vào việc mở rộng ngành hàng thông qua các campaign mùa vụ và xây dựng thương hiệu. Tận dụng các dịp đặc biệt để tạo ra sự chú ý và thu hút khách hàng mới.',
    tags: ['campaign', 'mùa vụ', 'marketing', 'thương hiệu'],
    difficulty_level: 3,
    estimated_time: '3-6 tháng',
    success_rate: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Tất cả ngành hàng',
    category: 'Ngành hàng áp dụng',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Mọi seller',
    objective: 'Áp dụng chiến lược cho mọi loại sản phẩm và ngành hàng',
    strategy_steps: [
      'Tất cả ngành hàng',
      'Tất cả ngành hàng (Áp dụng với shop đã có thương hiệu hoặc độ nhận diện cao)',
      'Phân tích đặc thù từng ngành',
      'Tùy chỉnh phù hợp với sản phẩm'
    ],
    benefits: [
      'Tính linh hoạt cao',
      'Áp dụng rộng rãi',
      'Dễ dàng tùy chỉnh',
      'Hiệu quả với nhiều sản phẩm'
    ],
    kpis: [
      'Tỷ lệ áp dụng thành công',
      'Mức độ tùy chỉnh',
      'Hiệu quả trên nhiều ngành'
    ],
    explanation: 'Đây là chiến lược tổng quát có thể áp dụng cho mọi ngành hàng với sự tùy chỉnh phù hợp. Đặc biệt hiệu quả với các shop đã có thương hiệu hoặc độ nhận diện cao trên thị trường.',
    tags: ['tổng quát', 'linh hoạt', 'đa ngành'],
    difficulty_level: 2,
    estimated_time: '1-2 tháng',
    success_rate: 82,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Chiến dịch theo mùa và dịp lễ',
    category: 'Công thức A1',
    industry: 'Thời trang/Gia dụng',
    target_audience: 'Seller có kinh nghiệm',
    objective: 'Tận dụng các dịp lễ tết, mùa vụ để tạo campaign đặc biệt',
    strategy_steps: [
      'Lên kế hoạch theo lịch mùa vụ',
      'Chuẩn bị sản phẩm phù hợp',
      'Tạo nội dung marketing hấp dẫn',
      'Chạy quảng cáo tập trung',
      'Theo dõi và tối ưu hiệu quả'
    ],
    benefits: [
      'Tăng doanh thu đột biến',
      'Tận dụng tâm lý mua sắm',
      'Tạo sự khác biệt',
      'Xây dựng thói quen mua hàng'
    ],
    kpis: [
      'Doanh thu campaign',
      'Lượt tương tác',
      'Tỷ lệ chuyển đổi',
      'Chi phí trên mỗi đơn hàng'
    ],
    explanation: 'Chiến lược tận dụng các dịp đặc biệt trong năm để tạo ra các campaign marketing mạnh mẽ, thu hút khách hàng và tăng doanh số bán hàng một cách đáng kể.',
    tags: ['campaign', 'mùa vụ', 'marketing', 'dịp lễ'],
    difficulty_level: 3,
    estimated_time: '1-2 tháng',
    success_rate: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Tăng cảm xúc qua bộ quà tặng',
    category: 'Công thức A',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Seller nâng cao',
    objective: 'Tạo bộ sản phẩm kết hợp để tăng cảm xúc mua hàng',
    strategy_steps: [
      'Tạo combo sản phẩm có giá trị cảm xúc cao',
      'Thiết kế packaging đẹp mắt',
      'Tạo câu chuyện cho bộ sản phẩm',
      'Marketing theo hướng cảm xúc',
      'Chăm sóc khách hàng sau bán'
    ],
    benefits: [
      'Tăng giá trị đơn hàng',
      'Tạo trải nghiệm đặc biệt',
      'Tăng lòng trung thành',
      'Word-of-mouth marketing'
    ],
    kpis: [
      'Average Order Value',
      'Customer Satisfaction',
      'Repeat Purchase Rate',
      'Referral Rate'
    ],
    explanation: 'Chiến lược tạo ra các bộ sản phẩm kết hợp nhằm tăng cường trải nghiệm cảm xúc của khách hàng và tăng giá trị đơn hàng thông qua việc kể chuyện và tạo kết nối.',
    tags: ['bundling', 'emotion', 'experience', 'premium'],
    difficulty_level: 4,
    estimated_time: '2-3 tháng',
    success_rate: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const sampleCategories: StrategyCategory[] = [
  {
    id: '1',
    name: 'Công thức A1',
    description: 'Chiến lược Marketing cơ bản',
    color: '#3B82F6',
    icon: 'play-circle'
  },
  {
    id: '2',
    name: 'Công thức A',
    description: 'Hướng dẫn áp dụng nâng cao',
    color: '#8B5CF6',
    icon: 'target'
  },
  {
    id: '3',
    name: 'Ngành hàng áp dụng',
    description: 'Lĩnh vực và đối tượng phù hợp',
    color: '#10B981',
    icon: 'briefcase'
  }
];

const sampleIndustries: StrategyIndustry[] = [
  { id: '1', name: 'Tất cả ngành hàng', description: 'Áp dụng cho mọi loại sản phẩm' },
  { id: '2', name: 'Thời trang/Gia dụng', description: 'Chuyên về thời trang và đồ gia dụng' },
  { id: '3', name: 'Thực phẩm đồ uống/Sắc đẹp', description: 'Ngành F&B và làm đẹp' }
];

export const useStrategies = () => {
  const { data: strategies = sampleStrategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_strategies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching strategies:', error);
        return sampleStrategies; // Fallback to sample data
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
