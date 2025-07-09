
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassificationType, ProductFormData } from '@/types/product';
import SingleClassificationForm from './SingleClassificationForm';
import DoubleClassificationForm from './DoubleClassificationForm';

interface ProductClassificationSectionProps {
  classificationType: ClassificationType;
  onClassificationTypeChange: (type: ClassificationType) => void;
}

const ProductClassificationSection: React.FC<ProductClassificationSectionProps> = ({
  classificationType,
  onClassificationTypeChange
}) => {
  return (
    <div className="space-y-4 p-4 border border-border rounded-md bg-card">
      <h3 className="font-semibold text-lg text-card-foreground">Phân Loại Sản Phẩm</h3>
      <div>
        <Label htmlFor="classificationType" className="text-card-foreground">Loại Phân Loại</Label>
        <Select
          value={classificationType}
          onValueChange={(value: ClassificationType) => onClassificationTypeChange(value)}
        >
          <SelectTrigger className="bg-background border-border text-foreground">
            <SelectValue placeholder="Chọn loại phân loại" className="text-foreground" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="single" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              Phân loại đơn (VD: Màu sắc)
            </SelectItem>
            <SelectItem value="double" className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              Phân loại kép (VD: Màu sắc + Kích thước)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {classificationType === 'single' ? <SingleClassificationForm /> : <DoubleClassificationForm />}
    </div>
  );
};

export default ProductClassificationSection;
