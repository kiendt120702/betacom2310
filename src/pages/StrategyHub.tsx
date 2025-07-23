
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, X } from 'lucide-react';
import { useStrategies, Strategy } from '@/hooks/useStrategies';

const StrategyHub = () => {
  const { strategies, categories, isLoading } = useStrategies();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      const matchesSearch = searchTerm === '' || 
        strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.explanation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [strategies, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all';

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopee Strategy Hub</h1>
              <p className="text-gray-600 mt-2">Khám phá và áp dụng các chiến lược kinh doanh hiệu quả</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm chiến lược theo tên, mục tiêu hoặc nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Bộ lọc:</span>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    <SelectItem value="A1">Công thức A1</SelectItem>
                    <SelectItem value="A">Công thức A</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Tìm kiếm: "{searchTerm}"
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSearchTerm('')}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Danh mục: {selectedCategory}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSelectedCategory('all')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Strategy Button */}
        <div className="mb-6">
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Thêm chiến lược
          </Button>
        </div>

        {/* Strategy Table */}
        <Card className="shadow-md">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="grid grid-cols-3 gap-6 p-6">
                <div>
                  <h3 className="font-bold text-lg">Công thức A1</h3>
                  <p className="text-sm text-orange-100 mt-1">Làm như thế nào (HOW)</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Công thức A</h3>
                  <p className="text-sm text-orange-100 mt-1">Để làm gì (WHY)</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Ngành hàng áp dụng</h3>
                  <p className="text-sm text-orange-100 mt-1">Phạm vi áp dụng</p>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredStrategies.map((strategy, index) => (
                <div 
                  key={strategy.id} 
                  className={`grid grid-cols-3 gap-6 p-6 hover:bg-gray-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Công thức A1 - HOW */}
                  <div className="flex items-center">
                    <div className="space-y-2">
                      <div className="text-gray-900 font-medium leading-relaxed">
                        {strategy.title}
                      </div>
                    </div>
                  </div>

                  {/* Công thức A - WHY */}
                  <div className="flex items-center">
                    <div className="space-y-2">
                      <div className="text-gray-900 font-semibold">
                        {strategy.objective}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {strategy.explanation}
                      </div>
                    </div>
                  </div>

                  {/* Ngành hàng áp dụng */}
                  <div className="flex items-center">
                    <div className="space-y-2">
                      <div className="text-gray-900 font-medium">
                        {strategy.target_audience}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {strategy.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {strategy.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{strategy.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredStrategies.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy chiến lược
            </h3>
            <p className="text-gray-600 mb-6">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyHub;
