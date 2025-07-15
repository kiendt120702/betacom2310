import React, { useState, useMemo, useEffect } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
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

  const level1Options = useMemo(() => {
    return [...new Set(categories.map(cat => parseCategoryName(cat.name).level1))].filter(Boolean);
  }, [categories]);

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

  const handleLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level1 = e.target.value;
    setSelectedLevel1(level1);
    setSelectedLevel2('');
    setSelectedLevel3('');
    onChange(''); // Clear final value
  };

  const handleLevel2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level2 = e.target.value;
    setSelectedLevel2(level2);
    setSelectedLevel3('');
    onChange(''); // Clear final value
  };

  const handleLevel3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level3 = e.target.value;
    setSelectedLevel3(level3);
    const finalCategory = categories.find(cat => {
      const parts = parseCategoryName(cat.name);
      return parts.level1 === selectedLevel1 && parts.level2 === selectedLevel2 && parts.level3 === level3;
    });
    if (finalCategory) {
      onChange(finalCategory.category_id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Ngành Hàng *</Label>
        <div className="text-sm text-muted-foreground">Đang tải danh sách ngành hàng...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Ngành Hàng *</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level 1 Selector */}
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Cấp 1</Label>
          <select
            value={selectedLevel1}
            onChange={handleLevel1Change}
            disabled={disabled}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Chọn ngành hàng cấp 1</option>
            {level1Options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2 Selector */}
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Cấp 2</Label>
          <select
            value={selectedLevel2}
            onChange={handleLevel2Change}
            disabled={!selectedLevel1 || disabled}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Chọn ngành hàng cấp 2</option>
            {level2Options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3 Selector */}
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Cấp 3</Label>
          <select
            value={selectedLevel3}
            onChange={handleLevel3Change}
            disabled={!selectedLevel2 || disabled}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Chọn ngành hàng cấp 3</option>
            {level3Options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;