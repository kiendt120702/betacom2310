import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductFormData } from '@/types/product';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const ShippingOptions: React.FC = () => {
  const { watch, setValue } = useFormContext<ProductFormData>();

  const instant = watch('instant');
  const fast = watch('fast');
  const bulky = watch('bulky');
  const express = watch('express');
  const economic = watch('economic'); // Watch new economic field

  const toggleOption = (field: 'instant' | 'fast' | 'bulky' | 'express' | 'economic', checked: boolean) => {
    setValue(field, checked, { shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground">Tùy Chọn Vận Chuyển</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={cn(
            "flex items-center justify-center p-4 border rounded-md cursor-pointer transition-colors",
            instant 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Checkbox
            id="instant"
            checked={instant}
            onCheckedChange={(checked: boolean) => toggleOption('instant', checked)}
            className={cn(
              "mr-2",
              instant ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : "border-border"
            )}
          />
          <Label htmlFor="instant" className="cursor-pointer">
            Siêu Tốc - 4 Giờ
          </Label>
        </div>

        <div
          className={cn(
            "flex items-center justify-center p-4 border rounded-md cursor-pointer transition-colors",
            fast 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Checkbox
            id="fast"
            checked={fast}
            onCheckedChange={(checked: boolean) => toggleOption('fast', checked)}
            className={cn(
              "mr-2",
              fast ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : "border-border"
            )}
          />
          <Label htmlFor="fast" className="cursor-pointer">
            Nhanh
          </Label>
        </div>

        {/* New: Tiết kiệm */}
        <div
          className={cn(
            "flex items-center justify-center p-4 border rounded-md cursor-pointer transition-colors",
            economic 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Checkbox
            id="economic"
            checked={economic}
            onCheckedChange={(checked: boolean) => toggleOption('economic', checked)}
            className={cn(
              "mr-2",
              economic ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : "border-border"
            )}
          />
          <Label htmlFor="economic" className="cursor-pointer">
            Tiết kiệm
          </Label>
        </div>

        <div
          className={cn(
            "flex items-center justify-center p-4 border rounded-md cursor-pointer transition-colors",
            bulky 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Checkbox
            id="bulky"
            checked={bulky}
            onCheckedChange={(checked: boolean) => toggleOption('bulky', checked)}
            className={cn(
              "mr-2",
              bulky ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : "border-border"
            )}
          />
          <Label htmlFor="bulky" className="cursor-pointer">
            Hàng Cồng Kềnh
          </Label>
        </div>

        <div
          className={cn(
            "flex items-center justify-center p-4 border rounded-md cursor-pointer transition-colors",
            express 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Checkbox
            id="express"
            checked={express}
            onCheckedChange={(checked: boolean) => toggleOption('express', checked)}
            className={cn(
              "mr-2",
              express ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : "border-border"
            )}
          />
          <Label htmlFor="express" className="cursor-pointer">
            Tủ Nhận Hàng
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ShippingOptions;