
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
    title: 'Mở rộng ngành sản phẩm từ 1 sản phẩm',
    category: 'Công thức A1',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Seller mới bắt đầu',
    objective: 'Chiến lược mở rộng danh mục từ 1 sản phẩm thành nhiều ngách mới',
    strategy_steps: [
      'Từ 1 sản phẩm → Đánh thêm 1 ngách mới (Đại nam/Đại nữ)',
      'Hoặc (Sữa tắm 3in1/8in1) → Đại bán Giang sinh: Crinkle, Tinmisu → Lõi lết: Bồ súa tã tắm, gội bán trai...'
    ],
    benefits: [
      'Tăng doanh thu từ nhiều sản phẩm',
      'Giảm rủi ro phụ thuộc vào 1 sản phẩm',
      'Mở rộng thị trường khách hàng'
    ],
    kpis: [
      'Số lượng sản phẩm mới',
      'Doanh thu từ sản phẩm mới',
      'Tỷ lệ chuyển đổi'
    ],
    explanation: 'Chiến lược này giúp seller mở rộng từ 1 sản phẩm ban đầu thành nhiều sản phẩm trong các ngách khác nhau, tạo sự đa dạng và giảm rủi ro kinh doanh.',
    tags: ['mở rộng', 'đa dạng hóa', 'tăng trưởng'],
    difficulty_level: 2,
    estimated_time: '2-3 tháng',
    success_rate: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Chiến dịch theo mùa và dịp lễ',
    category: 'Công thức A1',
    industry: 'Thời trang/Gia dụng',
    target_audience: 'Seller có kinh nghiệm',
    objective: 'Tận dụng các dịp lễ tết, mùa vụ để tạo campaign đặc biệt',
    strategy_steps: [
      'Dễ xuất khách đăng post, chạy campaign, gắn link trên website',
      'Chuỗi cửa hàng/Số lượng đối tác/... làm thành ảnh phụ thứ 2 và banner',
      'Các KOL/KOC hợp tác với thương...'
    ],
    benefits: [
      'Tăng doanh thu theo mùa',
      'Tận dụng xu hướng tiêu dùng',
      'Tạo buzz marketing hiệu quả'
    ],
    kpis: [
      'Doanh thu trong campaign',
      'Lượt tương tác',
      'Chi phí quảng cáo'
    ],
    explanation: 'Chiến lược tận dụng các dịp đặc biệt trong năm để tạo ra các campaign marketing mạnh mẽ, thu hút khách hàng và tăng doanh số bán hàng.',
    tags: ['campaign', 'mùa vụ', 'marketing'],
    difficulty_level: 3,
    estimated_time: '1-2 tháng',
    success_rate: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Thay đổi chiến lược giá để tăng CR',
    category: 'Công thức A1',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Seller muốn tối ưu giá',
    objective: 'Điều chỉnh giá bán và cách truyền thông giá để tăng tỷ lệ chuyển đổi',
    strategy_steps: [
      'Thay vì truyền thống chúng ta là "Đây tập bung 6in1 có độ đàn hồi cao đến 41n1 thì mình thay đổi thành "Đây tập bung 6in1 độ đàn hồi cao đến 41n1/tăng lên 300% so..."'
    ],
    benefits: [
      'Tăng tỷ lệ chuyển đổi',
      'Cải thiện nhận thức giá trị',
      'Tăng lợi nhuận'
    ],
    kpis: [
      'Conversion Rate',
      'Average Order Value',
      'Revenue per Customer'
    ],
    explanation: 'Chiến lược tập trung vào việc thay đổi cách thức định giá và truyền đạt giá trị sản phẩm để tăng tỷ lệ chuyển đổi từ khách hàng tiềm năng.',
    tags: ['pricing', 'conversion', 'optimization'],
    difficulty_level: 2,
    estimated_time: '2-4 tuần',
    success_rate: 82,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Tăng cảm xúc qua bộ quà tặng',
    category: 'Công thức A',
    industry: 'Tất cả ngành hàng',
    target_audience: 'Seller nâng cao',
    objective: 'Tạo bộ sản phẩm kết hợp để tăng cảm xúc mua hàng',
    strategy_steps: [
      'Tạo combo sản phẩm có giá trị cảm xúc cao',
      'Thiết kế packaging đẹp mắt',
      'Tạo câu chuyện cho bộ sản phẩm'
    ],
    benefits: [
      'Tăng giá trị đơn hàng',
      'Tạo trải nghiệm đặc biệt',
      'Tăng lòng trung thành'
    ],
    kpis: [
      'Average Order Value',
      'Customer Satisfaction',
      'Repeat Purchase Rate'
    ],
    explanation: 'Chiến lược tạo ra các bộ sản phẩm kết hợp nhằm tăng cường trải nghiệm cảm xúc của khách hàng và tăng giá trị đơn hàng.',
    tags: ['bundling', 'emotion', 'experience'],
    difficulty_level: 4,
    estimated_time: '1-2 tháng',
    success_rate: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Nâng cấp và thêm tính năng sản phẩm',
    category: 'Công thức A',
    industry: 'Ngành thời trang',
    target_audience: 'Seller có sản phẩm ổn định',
    objective: 'Cải tiến sản phẩm hiện có bằng cách thêm tính năng mới',
    strategy_steps: [
      'Phân tích feedback khách hàng',
      'Research tính năng mới trên thị trường',
      'Test và cải tiến sản phẩm'
    ],
    benefits: [
      'Tăng competitive advantage',
      'Đáp ứng nhu cầu khách hàng',
      'Tăng giá bán'
    ],
    kpis: [
      'Product Rating',
      'Customer Reviews',
      'Market Share'
    ],
    explanation: 'Chiến lược nâng cấp sản phẩm hiện có thông qua việc thêm các tính năng mới dựa trên phản hồi của khách hàng và xu hướng thị trường.',
    tags: ['product development', 'innovation', 'upgrade'],
    difficulty_level: 4,
    estimated_time: '2-3 tháng',
    success_rate: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const sampleCategories: StrategyCategory[] = [
  {
    id: '1',
    name: 'Công thức A1',
    description: 'Chiến lược cơ bản cho người mới bắt đầu',
    color: '#3B82F6',
    icon: 'play-circle'
  },
  {
    id: '2',
    name: 'Công thức A',
    description: 'Chiến lược nâng cao cho seller có kinh nghiệm',
    color: '#8B5CF6',
    icon: 'target'
  },
  {
    id: '3',
    name: 'Ngành hàng áp dụng',
    description: 'Chiến lược chuyên biệt theo từng ngành hàng',
    color: '#10B981',
    icon: 'briefcase'
  }
];

const sampleIndustries: StrategyIndustry[] = [
  { id: '1', name: 'Tất cả ngành hàng', description: 'Áp dụng cho mọi loại sản phẩm' },
  { id: '2', name: 'Thời trang/Gia dụng', description: 'Chuyên về thời trang và đồ gia dụng' },
  { id: '3', name: 'Ngành thời trang', description: 'Chuyên về thời trang' }
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
