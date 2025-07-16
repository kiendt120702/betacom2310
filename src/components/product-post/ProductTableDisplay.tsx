import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { ProductFormData, SingleVariant, Combination, ProductDisplayData, DoubleVariantOption } from '@/types/product';

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
    const baseData: Omit<ProductDisplayData, 'groupName1' | 'variant1Name' | 'groupName2' | 'variant2Name' | 'price' | 'stock' | 'weight'> = {
      category: product.category,
      productName: product.productName,
      description: product.description || '',
      productSku: '',
      productCode: product.productCode || '',
      instant: product.instant,
      fast: product.fast,
      bulky: product.bulky, // Corresponds to 'Tiết kiệm'
      express: product.express,
      coverImage: product.coverImage || '',
      imagesPerVariant: '',
      skuClassification: '',
      sizeChartTemplate: '',
      sizeChartImage: '',
      productImage1: product.supplementaryImages[0] || '',
      productImage2: product.supplementaryImages[1] || '',
      productImage3: product.supplementaryImages[2] || '',
      productImage4: product.supplementaryImages[3] || '',
      productImage5: product.supplementaryImages[4] || '',
      productImage6: product.supplementaryImages[5] || '',
      productImage7: product.supplementaryImages[6] || '',
      productImage8: product.supplementaryImages[7] || '',
      preorderDTS: '',
      failureReason: '',
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
        const variants1 = product.variants1 as DoubleVariantOption[];
        const variants2 = product.variants2 as DoubleVariantOption[] || [];
        variants1.forEach(v1 => {
          variants2.forEach(v2 => {
            displayData.push({
              ...baseData,
              groupName1: product.groupName1,
              variant1Name: v1.name, // Access .name property
              groupName2: product.groupName2 || '',
              variant2Name: v2.name, // Access .name property
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

  const columnCount = 29;

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[3500px]"> {/* Adjusted min-width */}
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50">
            <TableHead>Ngành hàng</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Mô tả sản phẩm</TableHead>
            <TableHead>Mã sản phẩm</TableHead>
            <TableHead>Tên nhóm phân loại hàng 1</TableHead>
            <TableHead>Tên phân loại hàng cho nhóm phân loại hàng 1</TableHead>
            <TableHead>Tên nhóm phân loại hàng 2</TableHead>
            <TableHead>Tên phân loại hàng cho nhóm phân loại hàng 2</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Kho hàng</TableHead>
            <TableHead>SKU phân loại</TableHead>
            <TableHead>Size Chart Template</TableHead>
            <TableHead>Size Chart Image</TableHead>
            <TableHead>Ảnh bìa</TableHead>
            <TableHead>Hình ảnh sản phẩm 1</TableHead>
            <TableHead>Hình ảnh sản phẩm 2</TableHead>
            <TableHead>Hình ảnh sản phẩm 3</TableHead>
            <TableHead>Hình ảnh sản phẩm 4</TableHead>
            <TableHead>Hình ảnh sản phẩm 5</TableHead>
            <TableHead>Hình ảnh sản phẩm 6</TableHead>
            <TableHead>Hình ảnh sản phẩm 7</TableHead>
            <TableHead>Hình ảnh sản phẩm 8</TableHead>
            <TableHead>Cân nặng</TableHead>
            <TableHead>Hỏa Tốc</TableHead>
            <TableHead>Nhanh</TableHead>
            <TableHead>Tiết kiệm</TableHead>
            <TableHead>Tủ Nhận Hàng</TableHead>
            <TableHead>Ngày chuẩn bị hàng cho đặt trước (Pre-order DTS)</TableHead>
            <TableHead>Lý do thất bại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="text-center py-12 text-gray-500">
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
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.productCode}</TableCell>
                  <TableCell>{item.groupName1}</TableCell>
                  <TableCell>{item.variant1Name}</TableCell>
                  <TableCell>{item.groupName2}</TableCell>
                  <TableCell>{item.variant2Name}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.skuClassification}</TableCell>
                  <TableCell>{item.sizeChartTemplate}</TableCell>
                  <TableCell>{item.sizeChartImage}</TableCell>
                  <TableCell>{item.coverImage && <a href={item.coverImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage1 && <a href={item.productImage1} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage2 && <a href={item.productImage2} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage3 && <a href={item.productImage3} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage4 && <a href={item.productImage4} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage5 && <a href={item.productImage5} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage6 && <a href={item.productImage6} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage7 && <a href={item.productImage7} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.productImage8 && <a href={item.productImage8} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link ảnh</a>}</TableCell>
                  <TableCell>{item.weight} g</TableCell>
                  <TableCell>{item.instant ? 'Bật' : 'Tắt'}</TableCell>
                  <TableCell>{item.fast ? 'Bật' : 'Tắt'}</TableCell>
                  <TableCell>{item.bulky ? 'Bật' : 'Tắt'}</TableCell>
                  <TableCell>{item.express ? 'Bật' : 'Tắt'}</TableCell>
                  <TableCell>{item.preorderDTS}</TableCell>
                  <TableCell>{item.failureReason}</TableCell>
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