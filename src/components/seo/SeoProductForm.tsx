import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SeoTitle {
  title: string;
  length: number;
}

const SeoProductForm = () => {
  const [formData, setFormData] = useState({
    keyword: "",
    productInfo: "",
    brand: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<SeoTitle[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSeoTitles = async () => {
    if (!formData.keyword.trim() || !formData.productInfo.trim()) {
      toast.error("Vui lòng nhập đầy đủ từ khóa chính và thông tin sản phẩm");
      return;
    }

    setIsLoading(true);
    setGeneratedTitles([]);

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-seo-title",
        {
          body: {
            keyword: formData.keyword.trim(),
            productInfo: formData.productInfo.trim(),
            brand: formData.brand.trim(),
          },
        },
      );

      if (error) {
        console.error("Supabase function error:", error);
        toast.error("Có lỗi xảy ra khi tạo tên sản phẩm");
        return;
      }

      if (data?.titles && Array.isArray(data.titles)) {
        const titlesWithLength = data.titles.map((title: string) => ({
          title: title.trim(),
          length: title.trim().length,
        }));
        setGeneratedTitles(titlesWithLength);
        toast.success(`Đã tạo ${titlesWithLength.length} tên sản phẩm SEO`);
      } else {
        toast.error("Không thể tạo tên sản phẩm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error generating SEO titles:", error);
      toast.error("Có lỗi xảy ra khi tạo tên sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Đã sao chép vào clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      toast.error("Không thể sao chép");
    }
  };

  const getTitleQuality = (length: number) => {
    if (length >= 120 && length <= 150) {
      return { color: "bg-green-500", text: "Tối ưu" };
    } else if (length >= 100 && length < 120) {
      return { color: "bg-yellow-500", text: "Khá tốt" };
    } else if (length > 150) {
      return { color: "bg-red-500", text: "Quá dài" };
    }
    return null; // Return null for lengths < 100 (formerly "Ngắn")
  };

  const resetForm = () => {
    setFormData({
      keyword: "",
      productInfo: "",
      brand: "",
    });
    setGeneratedTitles([]);
    setCopiedIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Tạo Tên Sản Phẩm SEO Shopee
        </h1>
        {/* Removed the description paragraph */}
      </div>

      {/* Input Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm font-medium">
              Từ khóa chính sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="keyword"
              placeholder="Nhập các từ khóa chính của sản phẩm..."
              value={formData.keyword}
              onChange={(e) => handleInputChange("keyword", e.target.value)}
              className="min-h-[100px] resize-y"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productInfo" className="text-sm font-medium">
              Thông tin sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="productInfo"
              placeholder="Mô tả chi tiết về sản phẩm: chất liệu, màu sắc, kích thước, tính năng đặc biệt, ưu điểm..."
              value={formData.productInfo}
              onChange={(e) =>
                handleInputChange("productInfo", e.target.value)
              }
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium">
              Tên thương hiệu (tùy chọn)
            </Label>
            <Input
              id="brand"
              placeholder="Thương hiệu..."
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={generateSeoTitles}
              disabled={
                isLoading ||
                !formData.keyword.trim() ||
                !formData.productInfo.trim()
              }
              className="flex-1 h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tên sản phẩm...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo Tên Sản Phẩm SEO
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={resetForm}
              className="px-6 h-12"
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Titles */}
      {generatedTitles.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              3 Chiến Lược SEO Khác Biệt
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mỗi tên sản phẩm áp dụng một chiến lược SEO riêng biệt. Chọn chiến lược phù hợp với mục tiêu của bạn.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedTitles.map((item, index) => {
              const quality = getTitleQuality(item.length);
              const isCopied = copiedIndex === index;

              // Define strategy info for each title
              const strategies = [
                { 
                  name: "BROAD MATCH SEO", 
                  icon: "🎯", 
                  color: "bg-blue-500", 
                  description: "Tối ưu độ phủ rộng từ khóa",
                  focus: "Tăng traffic & awareness"
                },
                { 
                  name: "EMOTIONAL & BENEFIT SEO", 
                  icon: "🎪", 
                  color: "bg-purple-500", 
                  description: "Tối ưu cảm xúc & lợi ích",
                  focus: "Tăng CTR & conversion"
                },
                { 
                  name: "LONG-TAIL NICHE SEO", 
                  icon: "🔍", 
                  color: "bg-green-500", 
                  description: "Tối ưu từ khóa dài & ngách",
                  focus: "Giảm cạnh tranh, tăng relevance"
                }
              ];

              const strategy = strategies[index] || strategies[0];

              return (
                <div
                  key={index}
                  className="group p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          className={`${strategy.color} text-white text-xs font-medium`}
                        >
                          {strategy.icon} {strategy.name}
                        </Badge>
                        {quality && ( // Only render if quality is not null
                          <>
                            <Badge
                              className={`${quality.color} text-white text-xs`}
                            >
                              {quality.text}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.length}/150 ký tự
                            </span>
                          </>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {strategy.description} • {strategy.focus}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.title, index)}
                      className={`ml-3 transition-all duration-200 ${
                        isCopied
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Sao chép
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Mẹo tối ưu SEO Shopee:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Tên sản phẩm tối ưu nên có 120-150 ký tự</li>
                <li>Đặt từ khóa chính ở đầu tên sản phẩm</li>
                <li>Bao gồm thông tin về ưu đãi và tính năng nổi bật</li>
                <li>Tránh lặp từ khóa quá nhiều lần</li>
              </ul>
            </div> */}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoProductForm;