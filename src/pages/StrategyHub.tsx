
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Target, TrendingUp, Filter, Eye } from 'lucide-react';
import { useStrategies, Strategy } from '@/hooks/useStrategies';
import { StrategyDetailModal } from '@/components/strategy/StrategyDetailModal';

const StrategyHub = () => {
  const { strategies, categories, industries, isLoading } = useStrategies();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      const matchesSearch = searchTerm === '' || 
        strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.explanation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;
      const matchesIndustry = selectedIndustry === 'all' || strategy.industry === selectedIndustry;

      return matchesSearch && matchesCategory && matchesIndustry;
    });
  }, [strategies, searchTerm, selectedCategory, selectedIndustry]);

  const handleViewDetails = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopee Strategy Hub</h1>
                <p className="text-sm text-gray-600">Hệ thống quản lý và giải thích chiến lược bán hàng</p>
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chiến lược
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold text-blue-900">{strategies.length}</div>
                  <div className="text-sm text-blue-700">Tổng chiến lược</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold text-green-900">{categories.length}</div>
                  <div className="text-sm text-green-700">Danh mục</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold text-orange-900">{industries.length}</div>
                  <div className="text-sm text-orange-700">Ngành hàng</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm chiến lược..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Tất cả ngành hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành hàng</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.name}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Table */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 bg-orange-50 border-b border-orange-200">
              <div className="col-span-4">
                <h3 className="font-bold text-orange-900 text-lg">Công thức A1</h3>
                <p className="text-sm text-orange-700">Chiến lược Marketing</p>
              </div>
              <div className="col-span-4">
                <h3 className="font-bold text-orange-900 text-lg">Công thức A</h3>
                <p className="text-sm text-orange-700">Hướng dẫn áp dụng</p>
              </div>
              <div className="col-span-3">
                <h3 className="font-bold text-orange-900 text-lg">Ngành hàng áp dụng</h3>
                <p className="text-sm text-orange-700">Lĩnh vực phù hợp</p>
              </div>
              <div className="col-span-1">
                <h3 className="font-bold text-orange-900 text-lg">Chi tiết</h3>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredStrategies.map((strategy, index) => (
                <div 
                  key={strategy.id} 
                  className={`grid grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* Công thức A1 */}
                  <div className="col-span-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{strategy.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {strategy.strategy_steps.slice(0, 3).map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 font-semibold">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                      {strategy.strategy_steps.length > 3 && (
                        <div className="text-orange-600 text-xs font-medium">
                          +{strategy.strategy_steps.length - 3} bước khác...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Công thức A */}
                  <div className="col-span-4">
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium text-gray-900">Mục tiêu:</span> {strategy.objective}
                    </div>
                    <div className="text-sm text-gray-600">
                      {strategy.explanation.length > 150 
                        ? `${strategy.explanation.substring(0, 150)}...` 
                        : strategy.explanation}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {strategy.benefits.slice(0, 2).map((benefit, i) => (
                        <span key={i} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {benefit}
                        </span>
                      ))}
                      {strategy.benefits.length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{strategy.benefits.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ngành hàng áp dụng */}
                  <div className="col-span-3">
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {strategy.industry}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Đối tượng:</span> {strategy.target_audience}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                        Độ khó: {strategy.difficulty_level}/5
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        {strategy.success_rate}% thành công
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết Button */}
                  <div className="col-span-1 flex items-start justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(strategy)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredStrategies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy chiến lược
            </h3>
            <p className="text-gray-600">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      <StrategyDetailModal
        strategy={selectedStrategy}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStrategy(null);
        }}
      />
    </div>
  );
};

export default StrategyHub;
