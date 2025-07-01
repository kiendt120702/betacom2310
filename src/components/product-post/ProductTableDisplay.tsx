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
      productSku: '', // Placeholder
      productCode: product.productCode,
      fast: product.fast,
      bulky: product.bulky,
      express: product.express,
      coverImage: product.coverImage || '', // Use actual cover image
      imagesPerVariant: '', // Placeholder, usually for variant-specific images
      skuClassification: '', // Placeholder
      sizeChartTemplate: '', // Placeholder
      sizeChartImage: '', // Placeholder
      productImage1: product.supplementaryImages[0] || '',
      productImage2: product.supplementaryImages[1] || '',
      productImage3: product.supplementaryImages[2] || '',
      productImage4: product.supplementaryImages[3] || '',
      productImage5: product.supplementaryImages[4] || '',
      productImage6: product.supplementaryImages[5] || '',
      productImage7: product.supplementaryImages[6] || '',
      productImage8: product.supplementaryImages[7] || '',
      weight: 0, // Placeholder, will be set by variant/combination
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
      <Table className="min-w-[3500px]"> {/* Increased min-width for more columns */}
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Ngành hàng</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[200px]">Tên sản phẩm</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[250px]">Mô tả sản phẩm</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">SKU sản phẩm</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Mã sản phẩm</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên nhóm phân loại hàng 1</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên phân loại hàng cho nhóm phân loại hàng 1</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Hình ảnh mỗi phân loại</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên nhóm phân loại hàng 2</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Tên phân loại hàng cho nhóm phân loại hàng 2</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Giá (VNĐ)</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Kho hàng</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">SKU phân loại</TableHead>
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
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Hỏa Tốc</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Nhanh</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[100px]">Hàng Cồng Kềnh</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[120px]">Tủ Nhận Hàng</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[180px]">Pre-order DTS</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 px-4 min-w-[150px]">Lý do thất bại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={31} className="text-center py-12 text-gray-500"> {/* Adjusted colSpan */}
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
                  <TableCell className="py-2 px-4 text-sm">{item.productSku}</TableCell> {/* New cell */}
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
                  <TableCell className="py-2 px-4 text-sm">
                    {item.coverImage && <a href={item.coverImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage1 && <a href={item.productImage1} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage2 && <a href={item.productImage2} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage3 && <a href={item.productImage3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage4 && <a href={item.productImage4} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage5 && <a href={item.productImage5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage6 && <a href={item.productImage6} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage7 && <a href={item.productImage7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">
                    {item.productImage8 && <a href={item.productImage8} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-sm">{item.weight} g</TableCell>
                  <TableCell className="py-2 px-4 text-sm">Tắt</TableCell> {/* Placeholder for 'Hỏa Tốc' */}
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