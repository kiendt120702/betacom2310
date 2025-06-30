import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductFormData } from '@/types/product';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const ShippingOptions: React.FC = () => {
  const { register, watch, setValue } = useFormContext<ProductFormData>();

  const fast = watch('fast');
  const bulky = watch('bulky');
  const express = watch('express');

  const toggleOption = (field: 'fast' | 'bulky' | 'express') => {
    setValue(field, !watch(field), { shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      <Label>Tùy Chọn Vận Chuyển</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={cn(
            "flex items-center justify-center p-4 border border-gray-200 rounded-md cursor-pointer transition-colors",
            fast ? "bg-primary text-primary-foreground" : "bg-gray-50 hover:bg-gray-100"
          )}
          onClick={() => toggleOption('fast')}
        >
          <Checkbox
            id="fast"
            checked={fast}
            onCheckedChange={() => toggleOption('fast')}
            className={cn(
              "mr-2",
              fast ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : ""
            )}
          />
          <Label htmlFor="fast" className={cn("cursor-pointer", fast ? "text-primary-foreground" : "text-gray-700")}>
            Nhanh
          </Label>
        </div>

        <div
          className={cn(
            "flex items-center justify-center p-4 border border-gray-200 rounded-md cursor-pointer transition-colors",
            bulky ? "bg-primary text-primary-foreground" : "bg-gray-50 hover:bg-gray-100"
          )}
          onClick={() => toggleOption('bulky')}
        >
          <Checkbox
            id="bulky"
            checked={bulky}
            onCheckedChange={() => toggleOption('bulky')}
            className={cn(
              "mr-2",
              bulky ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : ""
            )}
          />
          <Label htmlFor="bulky" className={cn("cursor-pointer", bulky ? "text-primary-foreground" : "text-gray-700")}>
            Hàng Cồng Kềnh
          </Label>
        </div>

        <div
          className={cn(
            "flex items-center justify-center p-4 border border-gray-200 rounded-md cursor-pointer transition-colors",
            express ? "bg-primary text-primary-foreground" : "bg-gray-50 hover:bg-gray-100"
          )}
          onClick={() => toggleOption('express')}
        >
          <Checkbox
            id="express"
            checked={express}
            onCheckedChange={() => toggleOption('express')}
            className={cn(
              "mr-2",
              express ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : ""
            )}
          />
          <Label htmlFor="express" className={cn("cursor-pointer", express ? "text-primary-foreground" : "text-gray-700")}>
            Tủ Nhận Hàng
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ShippingOptions;