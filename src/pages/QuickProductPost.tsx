import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Download, Package, X } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData, SingleVariant, Combination, ClassificationType, ProductDisplayData } from '@/types/product';
import SingleClassificationForm from '@/components/product-post/SingleClassificationForm';
import DoubleClassificationForm from '@/components/product-post/DoubleClassificationForm';
import ShippingOptions from '@/components/product-post/ShippingOptions';
import { cn } from '@/lib/utils';

// Zod schema for form validation
const productFormSchema = z.object({
  category: z.string().min(1, 'Ngành hàng là bắt buộc'),
  productCode: z.string().min(1, 'Mã sản phẩm là bắt buộc'),
  productName: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  classificationType: z.enum(['single', 'double']),
  groupName1: z.string().min(1, 'Tên nhóm phân loại 1 là bắt buộc'),
  variants1: z.array(z.union([
    z.object({
      name: z.string().min(1, 'Tên tùy chọn là bắt buộc'),
      price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
      stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
      weight: z.number().min(0, 'Cân nặng phải lớn hơn hoặc bằng 0'),
    }),
    z.string().min(1, 'Tên tùy chọn là bắt buộc') // For double classification, variants are just strings
  ])).min(1, 'Phải có ít nhất một tùy chọn cho phân loại 1'),
  groupName2: z.string().optional(),
  variants2: z.array(z.string().min(1, 'Tên tùy chọn là bắt buộc')).optional(),
  combinations: z.array(z.object({
    combination: z.string(),
    price: z.number().min(0, 'Giá là bắt buộc và phải lớn hơn hoặc bằng 0'),
    stock: z.number().int().min(0, 'Tồn kho là bắt buộc và phải lớn hơn hoặc bằng 0'),
    weight: z.number().min(0, 'Cân nặng là bắt buộc và phải lớn hơn hoặc bằng 0'),
  })).optional(),
  fast: z.boolean().default(false),
  bulky: z.boolean().default(false),
  express: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.classificationType === 'double') {
    if (!data.groupName2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tên nhóm phân loại 2 là bắt buộc cho phân loại kép',
        path: ['groupName2'],
      });
    }
    if (!data.variants2 || data.variants2.length === 0 || data.variants2.some(v => !v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phải có ít nhất một tùy chọn cho phân loại 2',
        path: ['variants2'],
      });
    }
    if (!data.combinations || data.combinations.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thông tin tổ hợp là bắt buộc',
        path: ['combinations'],
      });
    }
  }
});

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [classificationType, setClassificationType] = useState<ClassificationType>('single');
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category: '',
      productCode: '',
      productName: '',
      description: '',
      classificationType: 'single',
      groupName1: '',
      variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
      groupName2: '',
      variants2: [''],
      combinations: [],
      fast: false,
      bulky: false,
      express: false,
    },
  });

  const { handleSubmit, reset, control, formState: { errors } } = methods;

  useEffect(() => {
    // Reset variants when classification type changes
    if (classificationType === 'single') {
      reset({
        ...methods.getValues(),
        variants1: [{ name: '', price: 0, stock: 0, weight: 0 }],
        groupName2: '',
        variants2: [],
        combinations: [],
      });
    } else {
      reset({
        ...methods.getValues(),
        variants1: [''],
        variants2: [''],
        combinations: [],
      });
    }
  }, [classificationType, reset]);

  const onSubmit = (data: ProductFormData) => {
    setProducts((prev) => [...prev, data]);
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được thêm vào danh sách.",
    });
    setIsModalOpen(false);
    reset(); // Reset form after successful submission
    setClassificationType('single'); // Reset classification type for next product
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getProductDisplayData = (product: ProductFormData): ProductDisplayData[] => {
    const displayData: ProductDisplayData[] = [];
    const baseData = {
      category: product.category,
      productName: product.productName,
      description: product.description || '',
      productCode: product.productCode,
      fast: product.fast,
      bulky: product.bulky,
      express: product.express,
      coverImage: 'Chưa có ảnh', // Placeholder
      imagesPerVariant: 'Chưa có ảnh', // Placeholder
      skuClassification: '', // Placeholder
      sizeChartTemplate: '', // Placeholder
      sizeChartImage: '', // Placeholder
      productImage1: '', // Placeholder
      productImage2: '', // Placeholder
      productImage3: '', // Placeholder
      productImage4: '', // Placeholder
      productImage5: '', // Placeholder
      productImage6: '', // Placeholder
      productImage7: '', // Placeholder
      productImage8: '', // Placeholder
      length: 0, // Placeholder
      width: 0, // Placeholder
      height: 0, // Placeholder
      preorderDTS: '', // Placeholder
      failureReason: '', // Placeholder
    };

    if (product.classificationType === 'single') {
      (product.variants1 as SingleVariant[]).forEach(variant => {
        displayData.push({
          ...baseData,
          groupName1: product.groupName1,
          variant1Name: variant.name,
          groupName2: '',
          variant2Name: '',
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
        });
      });
    } else {
      if (product.combinations && product.combinations.length > 0) {
        product.combinations.forEach(combo => {
          const [variant1, variant2] = combo.combination.split(' - ');
          displayData.push({
            ...baseData,
            groupName1: product.groupName1,
            variant1Name: variant1,
            groupName2: product.groupName2 || '',
            variant2Name: variant2,
            price: combo.price,
            stock: combo.stock,
            weight: combo.weight,
          });
        });
      } else {
        // Fallback if combinations are not fully generated (e.g., due to validation issues)
        const variants1 = product.variants1 as string[];
        const variants2 = product.variants2 || [];
        variants1.forEach(v1 => {
          variants2.forEach(v2 => {
            displayData.push({
              ...baseData,
              groupName1: product.groupName1,
              variant1Name: v1,
              groupName2: product.groupName2 || '',
              variant2Name: v2,
              price: 0, // Default values
              stock: 0,
              weight: 0,
            });
          });
        });
      }
    }
    return displayData;
  };

  const exportToExcel = () => {
    if (products.length === 0) {
      toast({
        title: "Không có sản phẩm",
        description: "Chưa có sản phẩm nào để xuất Excel.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    const excelData: (string | number | boolean)[][] = [];

    const headers = [
      "STT", "Ngành hàng", "Tên sản phẩm", "Mô tả sản phẩm", "Mã sản phẩm",
      "Tên nhóm phân loại hàng 1", "Tên phân loại hàng cho nhóm phân loại hàng 1",
      "Hình ảnh mỗi phân loại", // New column
      "Tên nhóm phân loại hàng 2", "Tên phân loại hàng cho nhóm phân loại hàng 2",
      "Giá (VNĐ)", "Kho hàng", "SKU phân loại", // New column
      "Size Chart Template", "Size Chart Image", // New columns
      "Ảnh bìa", "Hình ảnh sản phẩm 1", "Hình ảnh sản phẩm 2", "Hình ảnh sản phẩm 3",
      "Hình ảnh sản phẩm 4", "Hình ảnh sản phẩm 5", "Hình ảnh sản phẩm 6",
      "Hình ảnh sản phẩm 7", "Hình ảnh sản phẩm 8",
      "Cân nặng (kg)", "Chiều dài", "Chiều rộng", "Chiều cao", // New columns
      "Hỏa Tốc", "Nhanh Hàng", "Cồng Kềnh", "Tủ Nhận Hàng",
      "Ngày chuẩn bị hàng cho đặt trước (Pre-order DTS)", "Lý do thất bại" // New columns
    ];

    excelData.push(headers);

    let rowNumber = 1;

    products.forEach((product) => {
      const displayItems = getProductDisplayData(product);
      displayItems.forEach(item => {
        excelData.push([
          rowNumber++,
          item.category,
          item.productName,
          item.description,
          item.productCode,
          item.groupName1,
          item.variant1Name,
          item.imagesPerVariant, // Placeholder
          item.groupName2,
          item.variant2Name,
          item.price,
          item.stock,
          item.skuClassification, // Placeholder
          item.sizeChartTemplate, // Placeholder
          item.sizeChartImage, // Placeholder
          item.coverImage, // Placeholder
          item.productImage1, // Placeholder
          item.productImage2, // Placeholder
          item.productImage3, // Placeholder
          item.productImage4, // Placeholder
          item.productImage5, // Placeholder
          item.productImage6, // Placeholder
          item.productImage7, // Placeholder
          item.productImage8, // Placeholder
          item.weight,
          item.length, // Placeholder
          item.width, // Placeholder
          item.height, // Placeholder
          item.fast ? "Bật" : "Tắt",
          item.bulky ? "Bật" : "Tắt",
          item.express ? "Bật" : "Tắt",
          item.preorderDTS, // Placeholder
          item.failureReason, // Placeholder
        ]);
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sản phẩm");

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");
    const fileName = `DanhSachSanPham_${timestamp}.xlsx`;

    try {
      XLSX.writeFile(wb, fileName);
      toast({
        title: "Xuất Excel thành công",
        description: "File Excel đã được tải về.",
      });
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/60">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  Đăng Nhanh Sản Phẩm
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Thêm sản phẩm và xuất file Excel để đăng lên sàn thương mại điện tử.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Sản Phẩm
                </Button>
                <Button onClick={exportToExcel} disabled={exporting || products.length === 0} className="bg-success hover:bg-success/90 text-success-foreground">
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" /> Xuất Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[3000px]"> {/* Increased min-width for more columns */}
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-3 px-4">STT</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Ngành hàng</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[200px]">Tên sản phẩm</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[250px]">Mô tả sản phẩm</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Mã sản phẩm</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên nhóm PL1</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên PL1</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh PL</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên nhóm PL2</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên PL2</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Giá (VNĐ)</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Kho hàng</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">SKU PL</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Size Chart Template</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Size Chart Image</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh bìa</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP1</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP2</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP3</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP4</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP5</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP6</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP7</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Ảnh SP8</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Cân nặng (kg)</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều dài</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều rộng</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều cao</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Hỏa Tốc</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Nhanh Hàng</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Cồng Kềnh</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Tủ Nhận Hàng</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Pre-order DTS</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Lý do thất bại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={34} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-12 h-12 mb-4 text-gray-400" />
                          <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào</h3>
                          <p className="mb-4">Nhấn "Thêm Sản Phẩm" để bắt đầu</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.flatMap((product, productIndex) => {
                      const displayItems = getProductDisplayData(product);
                      return displayItems.map((item, itemIndex) => (
                        <TableRow key={`${productIndex}-${itemIndex}`} className="hover:bg-gray-50">
                          <TableCell className="py-2 px-4 text-center text-sm">{productIndex * displayItems.length + itemIndex + 1}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.category}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productName}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.description}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productCode}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.groupName1}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.variant1Name}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.imagesPerVariant}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.groupName2}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.variant2Name}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{formatPrice(item.price)}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.stock}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.skuClassification}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.sizeChartTemplate}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.sizeChartImage}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.coverImage}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage1}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage2}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage3}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage4}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage5}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage6}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage7}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.productImage8}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.weight} kg</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.length}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.width}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.height}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.fast ? 'Bật' : 'Tắt'}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.bulky ? 'Bật' : 'Tắt'}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.express ? 'Bật' : 'Tắt'}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.preorderDTS}</TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.failureReason}</TableCell>
                        </TableRow>
                      ));
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Ngành Hàng *</Label>
                  <Input
                    id="category"
                    placeholder="Nhập ngành hàng"
                    {...methods.register('category')}
                  />
                  {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <Label htmlFor="productCode">Mã Sản Phẩm *</Label>
                  <Input
                    id="productCode"
                    placeholder="Nhập mã sản phẩm"
                    {...methods.register('productCode')}
                  />
                  {errors.productCode && <p className="text-destructive text-sm mt-1">{errors.productCode.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="productName">Tên Sản Phẩm *</Label>
                <Input
                  id="productName"
                  placeholder="Nhập tên sản phẩm"
                  {...methods.register('productName')}
                />
                {errors.productName && <p className="text-destructive text-sm mt-1">{errors.productName.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Mô Tả Sản Phẩm</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Nhập mô tả sản phẩm"
                  {...methods.register('description')}
                />
              </div>

              <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="font-semibold text-lg">Phân Loại Sản Phẩm</h3>
                <div>
                  <Label htmlFor="classificationType">Loại Phân Loại</Label>
                  <Select
                    value={classificationType}
                    onValueChange={(value: ClassificationType) => setClassificationType(value)}
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

                {classificationType === 'single' ? (
                  <SingleClassificationForm />
                ) : (
                  <DoubleClassificationForm />
                )}
              </div>

              <ShippingOptions />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Lưu Sản Phẩm
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickProductPost;