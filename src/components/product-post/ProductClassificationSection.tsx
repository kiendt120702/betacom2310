
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
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h3 className="font-semibold text-lg">Phân Loại Sản Phẩm</h3>
      <div>
        <Label htmlFor="classificationType">Loại Phân Loại</Label>
        <Select
          value={classificationType}
          onValueChange={(value: ClassificationType) => onClassificationTypeChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại phân loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Phân loại đơn (VD: Màu sắc)</SelectItem>
            <SelectItem value="double">Phân loại kép (VD: Màu sắc + Kích thước)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {classificationType === 'single' ? <SingleClassificationForm /> : <DoubleClassificationForm />}
    </div>
  );
};

export default ProductClassificationSection;
