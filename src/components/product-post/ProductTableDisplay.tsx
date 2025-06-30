import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { ProductFormData, SingleVariant, Combination, ProductDisplayData } from '@/types/product';

interface ProductTableDisplayProps {
  products: ProductFormData[];
}

const ProductTableDisplay: React.FC<ProductTableDisplayProps> = ({ products }) => {
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
              price: 0,
              stock: 0,
              weight: 0,
            });
          });
        });
      }
    }
    return displayData;
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[3000px]"> {/* Increased min-width for more columns */}
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50">
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
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Cân nặng (g)</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều dài</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều rộng</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Chiều cao</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Hỏa Tốc</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Hàng Cồng Kềnh</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Tủ Nhận Hàng</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Pre-order DTS</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Lý do thất bại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={32} className="text-center py-12 text-gray-500"> {/* Adjusted colSpan */}
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
                  <TableCell className="py-2 px-4 text-sm">{item.weight} g</TableCell>
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
  );
};

export default ProductTableDisplay;