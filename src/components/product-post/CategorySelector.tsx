import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProductCategories } from '@/hooks/useProductCategories';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const { data: categories = [], isLoading } = useProductCategories();

  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-foreground">Ngành Hàng *</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id="category" className="bg-background border-border text-foreground">
          <SelectValue placeholder={isLoading ? "Đang tải ngành hàng..." : "Chọn ngành hàng"} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {categories.map(category => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;