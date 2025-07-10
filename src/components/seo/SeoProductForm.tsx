import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SeoProductForm = () => {
  const [formData, setFormData] = useState({
    keyword: '',
    brand: '',
    productInfo: ''
  });
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateTitles = async () => {
    if (!formData.keyword.trim() || !formData.productInfo.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập từ khóa chính và thông tin sản phẩm",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const productInfoText = `
Từ khóa chính: ${formData.keyword}
${formData.brand ? `Thương hiệu: ${formData.brand}` : ''}
Thông tin sản phẩm: ${formData.productInfo}
      `.trim();

      // Generate 3 different SEO titles
      const promises = Array(3).fill(null).map(() => 
        supabase.functions.invoke('generate-seo-title', {
          body: { productInfo: productInfoText }
        })
      );

      const responses = await Promise.all(promises);
      const titles = responses
        .filter(response => !response.error)
        .map(response => response.data?.seoTitle)
        .filter(title => title && title.trim());

      if (titles.length === 0) {
        throw new Error('Không thể tạo tên sản phẩm SEO');
      }

      setResults(titles);
    } catch (error) {
      console.error('Error generating SEO titles:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo tên sản phẩm SEO. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Đã sao chép",
        description: "Tên sản phẩm đã được sao chép vào clipboard"
      });
      
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Tạo Tên Sản Phẩm Chuẩn SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm font-medium text-foreground">
              Từ khóa chính sản phẩm *
            </Label>
            <Textarea
              id="keyword"
              placeholder="Nhập từ khóa chính của sản phẩm..."
              value={formData.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium text-foreground">
              Thương hiệu
            </Label>
            <Textarea
              id="brand"
              placeholder="Nhập thương hiệu sản phẩm (nếu có)..."
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="min-h-[80px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productInfo" className="text-sm font-medium text-foreground">
              Thông tin sản phẩm *
            </Label>
            <Textarea
              id="productInfo"
              placeholder="Mô tả chi tiết về sản phẩm: đặc điểm, công dụng, chất liệu, kích thước, màu sắc..."
              value={formData.productInfo}
              onChange={(e) => handleInputChange('productInfo', e.target.value)}
              className="min-h-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
              rows={5}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateTitles}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-base font-medium rounded-lg shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                'TẠO TÊN CHUẨN SEO'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              Kết quả
              <Copy className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      Tùy chọn {index + 1}:
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {result}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result, index)}
                    className="flex-shrink-0 border-border hover:bg-muted"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoProductForm;