
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import ProductForm from '@/components/product-manager/ProductForm';
import ProductTable from '@/components/product-manager/ProductTable';
import { Product } from '@/types/product';

const ProductBulkManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? product : p));
      setEditingProduct(null);
    } else {
      setProducts(prev => [...prev, product]);
    }
    setShowForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'san-pham-shopee.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý sản phẩm hàng loạt
          </h1>
          <p className="text-gray-600">
            Thêm sản phẩm, tạo nội dung bằng AI và xuất Excel theo mẫu Shopee
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              Danh sách sản phẩm
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sản phẩm đã thêm ({products.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm sản phẩm
                    </Button>
                    <Button
                      onClick={handleExportExcel}
                      disabled={products.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <ProductForm
              product={editingProduct}
              onSave={handleAddProduct}
              onCancel={() => {
                setEditingProduct(null);
                setShowForm(false);
              }}
            />
          </TabsContent>
        </Tabs>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ProductForm
                product={editingProduct}
                onSave={handleAddProduct}
                onCancel={() => {
                  setEditingProduct(null);
                  setShowForm(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBulkManager;
