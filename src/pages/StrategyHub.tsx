
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Search, Grid } from 'lucide-react';
import { useStrategies, Strategy } from '@/hooks/useStrategies';
import { StrategyDashboard } from '@/components/strategy/StrategyDashboard';
import { StrategyFilters } from '@/components/strategy/StrategyFilters';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { StrategyDetailModal } from '@/components/strategy/StrategyDetailModal';

const StrategyHub = () => {
  const { strategies, categories, industries, isLoading } = useStrategies();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      const matchesSearch = searchTerm === '' || 
        strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.explanation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory;
      const matchesIndustry = selectedIndustry === 'all' || strategy.industry === selectedIndustry;
      const matchesDifficulty = selectedDifficulty === 'all' || 
        strategy.difficulty_level === parseInt(selectedDifficulty);

      return matchesSearch && matchesCategory && matchesIndustry && matchesDifficulty;
    });
  }, [strategies, searchTerm, selectedCategory, selectedIndustry, selectedDifficulty]);

  const handleViewDetails = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedIndustry('all');
    setSelectedDifficulty('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Shopee Strategy Hub
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá và áp dụng các chiến lược Shopee hiệu quả nhất
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Tìm Kiếm
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Tất Cả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <StrategyDashboard 
            strategies={strategies}
            categories={categories}
            industries={industries}
          />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <StrategyFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedIndustry={selectedIndustry}
                onIndustryChange={setSelectedIndustry}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={setSelectedDifficulty}
                categories={categories}
                industries={industries}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>

          <div className="text-sm text-gray-600 mb-4">
            Tìm thấy {filteredStrategies.length} chiến lược
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredStrategies.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy chiến lược
              </h3>
              <p className="text-gray-600">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Hiển thị tất cả {strategies.length} chiến lược
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {strategies.length === 0 && (
            <div className="text-center py-12">
              <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có chiến lược nào
              </h3>
              <p className="text-gray-600">
                Hệ thống đang được cập nhật với các chiến lược mới
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
