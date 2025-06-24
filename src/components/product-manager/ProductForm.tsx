
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Brain, Plus, Trash2, Upload } from 'lucide-react';
import { Product, ProductVariation } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Thời trang nam', 'Thời trang nữ', 'Giày dép', 'Túi xách', 'Phụ kiện',
  'Điện tử', 'Máy tính', 'Điện thoại', 'Máy ảnh', 'Đồng hồ',
  'Sức khỏe', 'Làm đẹp', 'Mẹ & Bé', 'Nhà cửa', 'Đời sống',
  'Thể thao', 'Du lịch', 'Ô tô', 'Xe máy', 'Sách'
];

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { toast } = useToast();
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [tier1Name, setTier1Name] = useState('');
  const [tier2Name, setTier2Name] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      weight: product?.weight || 100,
    }
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        weight: product.weight,
      });
      setVariations(product.variations);
      setTier1Name(product.tier1Name || '');
      setTier2Name(product.tier2Name || '');
      setImages(product.images);
    }
  }, [product, form]);

  const generateSKU = (name: string) => {
    const words = name.split(' ').filter(word => word.length > 0);
    const sku = words.slice(0, 3)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    return sku.padEnd(3, '0');
  };

  const generateProductName = async () => {
    const currentName = form.getValues('name');
    if (!currentName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên sản phẩm hoặc từ khóa trước",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingName(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-chat', {
        body: {
          message: `Tạo tên sản phẩm chuẩn SEO cho: ${currentName}`,
          conversationId: null
        }
      });

      if (error) throw error;

      // Extract product name from AI response
      const response = data.response;
      const nameMatch = response.match(/(?:Dựa trên thông tin bạn cung cấp, đây là tên sản phẩm chuẩn SEO:|tên sản phẩm chuẩn SEO:)\s*(.+?)(?:\n|$)/i);
      if (nameMatch && nameMatch[1]) {
        form.setValue('name', nameMatch[1].trim());
      } else {
        form.setValue('name', response.split('\n')[0].trim());
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo tên sản phẩm bằng AI",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingName(false);
    }
  };

  const generateDescription = async () => {
    const currentName = form.getValues('name');
    if (!currentName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên sản phẩm trước",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-chat', {
        body: {
          message: `Tạo mô tả sản phẩm chuẩn SEO cho: ${currentName}`,
          conversationId: null
        }
      });

      if (error) throw error;

      form.setValue('description', data.response);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo mô tả sản phẩm bằng AI",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages: string[] = [];

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: `File ${file.name} vượt quá 2MB`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const base64 = await base64Promise;
        newImages.push(base64);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }

    setImages(prev => [...prev, ...newImages].slice(0, 9));
  };

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: Date.now().toString(),
      name: '',
      price: form.getValues('price'),
      stock: form.getValues('stock'),
      tier1: '',
      tier2: tier2Name ? '' : undefined,
    };
    setVariations(prev => [...prev, newVariation]);
  };

  const updateVariation = (id: string, field: keyof ProductVariation, value: any) => {
    setVariations(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const removeVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const onSubmit = (data: any) => {
    const productData: Product = {
      id: product?.id || Date.now().toString(),
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      stock: data.stock,
      weight: data.weight,
      sku: generateSKU(data.name),
      images: images,
      variations: variations,
      tier1Name: tier1Name || undefined,
      tier2Name: tier2Name || undefined,
      createdAt: product?.createdAt || new Date(),
    };

    onSave(productData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Tên sản phẩm là bắt buộc' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm hoặc từ khóa" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={generateProductName}
                        disabled={isGeneratingName}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Brain className="w-4 h-4" />
                        {isGeneratingName ? 'Đang tạo...' : 'AI'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                rules={{ required: 'Vui lòng chọn ngành hàng' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành hàng</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngành hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Mô tả sản phẩm là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả sản phẩm</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả sản phẩm"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={generateDescription}
                      disabled={isGeneratingDescription}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isGeneratingDescription ? 'Đang tạo mô tả...' : 'Tạo mô tả bằng AI'}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price, Stock, Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="999999"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cân nặng (gram)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images Upload */}
            <div>
              <FormLabel>Hình ảnh sản phẩm (tối đa 9 ảnh, mỗi ảnh ≤ 2MB)</FormLabel>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="mb-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải ảnh lên
                </Button>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Variations */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Phân loại sản phẩm</FormLabel>
                <Button
                  type="button"
                  onClick={addVariation}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm phân loại
                </Button>
              </div>

              {variations.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Tên nhóm phân loại 1 (VD: Size)"
                      value={tier1Name}
                      onChange={(e) => setTier1Name(e.target.value)}
                    />
                    <Input
                      placeholder="Tên nhóm phân loại 2 (VD: Màu sắc) - Tùy chọn"
                      value={tier2Name}
                      onChange={(e) => setTier2Name(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    {variations.map((variation, index) => (
                      <div key={variation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Phân loại {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariation(variation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Input
                            placeholder={tier1Name || "Phân loại 1"}
                            value={variation.tier1}
                            onChange={(e) => updateVariation(variation.id, 'tier1', e.target.value)}
                          />
                          {tier2Name && (
                            <Input
                              placeholder={tier2Name}
                              value={variation.tier2 || ''}
                              onChange={(e) => updateVariation(variation.id, 'tier2', e.target.value)}
                            />
                          )}
                          <Input
                            type="number"
                            placeholder="Giá"
                            value={variation.price}
                            onChange={(e) => updateVariation(variation.id, 'price', Number(e.target.value))}
                          />
                          <Input
                            type="number"
                            placeholder="Tồn kho"
                            value={variation.stock}
                            onChange={(e) => updateVariation(variation.id, 'stock', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {product ? 'Cập nhật' : 'Thêm sản phẩm'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
