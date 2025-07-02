import React, { useState, useMemo, useEffect } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CategorySelectorProps {
  value: string; // This will be the category_id
  onChange: (value: string) => void;
  disabled?: boolean;
}

const parseCategoryName = (name: string) => {
  const cleanedName = name.replace(/^\d+-\s*/, '').trim();
  const parts = cleanedName.split('/');
  return {
    level1: parts[0]?.trim() || '',
    level2: parts[1]?.trim() || '',
    level3: parts[2]?.trim() || '',
  };
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange, disabled }) => {
  const { data: categories = [], isLoading } = useProductCategories();

  const [selectedLevel1, setSelectedLevel1] = useState<string>('');
  const [selectedLevel2, setSelectedLevel2] = useState<string>('');
  const [selectedLevel3, setSelectedLevel3] = useState<string>('');

  // When the value (category_id) changes from the form, update the selectors
  useEffect(() => {
    if (value && categories.length > 0) {
      const selectedCategory = categories.find(c => c.category_id === value);
      if (selectedCategory) {
        const { level1, level2, level3 } = parseCategoryName(selectedCategory.name);
        setSelectedLevel1(level1);
        setSelectedLevel2(level2);
        setSelectedLevel3(level3);
      }
    } else {
        setSelectedLevel1('');
        setSelectedLevel2('');
        setSelectedLevel3('');
    }
  }, [value, categories]);

  const level1Options = useMemo(() => [...new Set(categories.map(cat => parseCategoryName(cat.name).level1))].filter(Boolean), [categories]);

  const level2Options = useMemo(() => {
    if (!selectedLevel1) return [];
    return [...new Set(categories
      .filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1)
      .map(cat => parseCategoryName(cat.name).level2)
    )].filter(Boolean);
  }, [categories, selectedLevel1]);

  const level3Options = useMemo(() => {
    if (!selectedLevel1 || !selectedLevel2) return [];
    return [...new Set(categories
      .filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1 && parseCategoryName(cat.name).level2 === selectedLevel2)
      .map(cat => parseCategoryName(cat.name).level3)
    )].filter(Boolean);
  }, [categories, selectedLevel1, selectedLevel2]);

  const handleLevel1Change = (level1: string) => {
    setSelectedLevel1(level1);
    setSelectedLevel2('');
    setSelectedLevel3('');
    onChange(''); // Clear final value
  };

  const handleLevel2Change = (level2: string) => {
    setSelectedLevel2(level2);
    setSelectedLevel3('');
    onChange(''); // Clear final value
  };

  const handleLevel3Change = (level3: string) => {
    setSelectedLevel3(level3);
    const finalCategory = categories.find(cat => {
      const parts = parseCategoryName(cat.name);
      return parts.level1 === selectedLevel1 && parts.level2 === selectedLevel2 && parts.level3 === level3;
    });
    if (finalCategory) {
      onChange(finalCategory.category_id);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Ngành Hàng *</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={selectedLevel1}
          onValueChange={handleLevel1Change}
          disabled={disabled || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Đang tải..." : "Chọn ngành hàng cấp 1"} />
          </SelectTrigger>
          <SelectContent>
            {level1Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={selectedLevel2}
          onValueChange={handleLevel2Change}
          disabled={!selectedLevel1 || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn ngành hàng cấp 2" />
          </SelectTrigger>
          <SelectContent>
            {level2Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={selectedLevel3}
          onValueChange={handleLevel3Change}
          disabled={!selectedLevel2 || isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn ngành hàng cấp 3" />
          </SelectTrigger>
          <SelectContent>
            {level3Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CategorySelector;