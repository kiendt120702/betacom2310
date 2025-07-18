import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { StrategyCategory } from '@/hooks/useStrategies'; // Removed StrategyIndustry

interface StrategyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  // Removed selectedIndustry: string;
  // Removed onIndustryChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  categories: StrategyCategory[];
  // Removed industries: StrategyIndustry[];
  onClearFilters: () => void;
}

export const StrategyFilters: React.FC<StrategyFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  // Removed selectedIndustry,
  // Removed onIndustryChange,
  selectedDifficulty,
  onDifficultyChange,
  categories,
  // Removed industries,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm; // Adjusted condition

  return (
    <div className="space-y-4">
      {/* Tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm chiến lược theo tên, mục tiêu, hoặc nội dung..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Danh mục" />
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

        {/* Removed Industry Select */}

        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="1">Rất dễ (1)</SelectItem>
            <SelectItem value="2">Dễ (2)</SelectItem>
            <SelectItem value="3">Trung bình (3)</SelectItem>
            <SelectItem value="4">Khó (4)</SelectItem>
            <SelectItem value="5">Rất khó (5)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Hiển thị bộ lọc active */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tìm kiếm: "{searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedCategory && selectedCategory !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Danh mục: {selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
          {/* Removed selectedIndustry badge */}
          {selectedDifficulty && selectedDifficulty !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Độ khó: {selectedDifficulty}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onDifficultyChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};