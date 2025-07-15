import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';

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

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchPlaceholder: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  searchPlaceholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm
          border border-input bg-background rounded-md cursor-pointer
          transition-all duration-200 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-ring'}
          ${isOpen ? 'border-ring ring-2 ring-ring/20' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-muted rounded-sm transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option}
                  className={`
                    px-3 py-2 text-sm cursor-pointer transition-colors
                    hover:bg-accent hover:text-accent-foreground
                    ${value === option ? 'bg-accent text-accent-foreground' : ''}
                  `}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Ngành Hàng *</Label>
        <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          Đang tải danh sách ngành hàng...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Ngành Hàng *</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level 1 Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Cấp 1</Label>
          <CustomDropdown
            options={level1Options}
            value={selectedLevel1}
            onChange={handleLevel1Change}
            placeholder="Chọn ngành hàng cấp 1"
            disabled={disabled}
            searchPlaceholder="Tìm kiếm cấp 1..."
          />
        </div>

        {/* Level 2 Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Cấp 2</Label>
          <CustomDropdown
            options={level2Options}
            value={selectedLevel2}
            onChange={handleLevel2Change}
            placeholder="Chọn ngành hàng cấp 2"
            disabled={!selectedLevel1 || disabled}
            searchPlaceholder="Tìm kiếm cấp 2..."
          />
        </div>

        {/* Level 3 Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Cấp 3</Label>
          <CustomDropdown
            options={level3Options}
            value={selectedLevel3}
            onChange={handleLevel3Change}
            placeholder="Chọn ngành hàng cấp 3"
            disabled={!selectedLevel2 || disabled}
            searchPlaceholder="Tìm kiếm cấp 3..."
          />
        </div>
      </div>
      
      {/* Selected category display */}
      {selectedLevel1 && selectedLevel2 && selectedLevel3 && (
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30">
          <div className="text-sm text-muted-foreground mb-1">Ngành hàng đã chọn:</div>
          <div className="text-sm font-medium">
            {selectedLevel1} → {selectedLevel2} → {selectedLevel3}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;