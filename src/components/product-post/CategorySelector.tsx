import React, { useState, useMemo, useEffect } from 'react';
import { useProductCategories } from '@/hooks/useProductCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const [openLevel1, setOpenLevel1] = useState(false);
  const [openLevel2, setOpenLevel2] = useState(false);
  const [openLevel3, setOpenLevel3] = useState(false);

  const [searchLevel1, setSearchLevel1] = useState('');
  const [searchLevel2, setSearchLevel2] = useState('');
  const [searchLevel3, setSearchLevel3] = useState('');

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
    const options = [...new Set(categories.map(cat => parseCategoryName(cat.name).level1))].filter(Boolean);
    return options.filter(opt => opt.toLowerCase().includes(searchLevel1.toLowerCase()));
  }, [categories, searchLevel1]);

  const level2Options = useMemo(() => {
    if (!selectedLevel1) return [];
    const options = [...new Set(categories
      .filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1)
      .map(cat => parseCategoryName(cat.name).level2)
    )].filter(Boolean);
    return options.filter(opt => opt.toLowerCase().includes(searchLevel2.toLowerCase()));
  }, [categories, selectedLevel1, searchLevel2]);

  const level3Options = useMemo(() => {
    if (!selectedLevel1 || !selectedLevel2) return [];
    const options = [...new Set(categories
      .filter(cat => parseCategoryName(cat.name).level1 === selectedLevel1 && parseCategoryName(cat.name).level2 === selectedLevel2)
      .map(cat => parseCategoryName(cat.name).level3)
    )].filter(Boolean);
    return options.filter(opt => opt.toLowerCase().includes(searchLevel3.toLowerCase()));
  }, [categories, selectedLevel1, selectedLevel2, searchLevel3]);

  const handleLevel1Change = (level1: string) => {
    setSelectedLevel1(level1);
    setSelectedLevel2('');
    setSelectedLevel3('');
    onChange(''); // Clear final value
    setOpenLevel1(false);
    setSearchLevel1('');
  };

  const handleLevel2Change = (level2: string) => {
    setSelectedLevel2(level2);
    setSelectedLevel3('');
    onChange(''); // Clear final value
    setOpenLevel2(false);
    setSearchLevel2('');
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
    setOpenLevel3(false);
    setSearchLevel3('');
  };

  return (
    <div className="space-y-2">
      <Label>Ngành Hàng *</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level 1 Selector */}
        <Popover open={openLevel1} onOpenChange={setOpenLevel1}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLevel1}
              className="w-full justify-between"
              disabled={disabled || isLoading}
            >
              {selectedLevel1 || (isLoading ? "Đang tải..." : "Chọn ngành hàng cấp 1")}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Tìm kiếm ngành hàng cấp 1..."
                value={searchLevel1}
                onValueChange={setSearchLevel1}
              />
              <CommandEmpty>Không tìm thấy ngành hàng.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {level1Options.map(opt => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => handleLevel1Change(opt)}
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Level 2 Selector */}
        <Popover open={openLevel2} onOpenChange={setOpenLevel2}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLevel2}
              className="w-full justify-between"
              disabled={!selectedLevel1 || disabled || isLoading}
            >
              {selectedLevel2 || "Chọn ngành hàng cấp 2"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Tìm kiếm ngành hàng cấp 2..."
                value={searchLevel2}
                onValueChange={setSearchLevel2}
              />
              <CommandEmpty>Không tìm thấy ngành hàng.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {level2Options.map(opt => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => handleLevel2Change(opt)}
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Level 3 Selector */}
        <Popover open={openLevel3} onOpenChange={setOpenLevel3}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openLevel3}
              className="w-full justify-between"
              disabled={!selectedLevel2 || disabled || isLoading}
            >
              {selectedLevel3 || "Chọn ngành hàng cấp 3"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Tìm kiếm ngành hàng cấp 3..."
                value={searchLevel3}
                onValueChange={setSearchLevel3}
              />
              <CommandEmpty>Không tìm thấy ngành hàng.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {level3Options.map(opt => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => handleLevel3Change(opt)}
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default CategorySelector;