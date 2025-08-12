import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  productName: z.string().optional(),
  keywords: z.string().min(1, { message: "Từ khóa là bắt buộc." }),
  productDescriptionRaw: z
    .string()
    .min(1, { message: "Mô tả sản phẩm là bắt buộc." }),
});

type SeoDescriptionFormData = z.infer<typeof formSchema>;

const SeoProductDescriptionForm = () => {
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const form = useForm<SeoDescriptionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      keywords: "",
      productDescriptionRaw: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: SeoDescriptionFormData) => {
    setGeneratedDescription("");
    setCopied(false);

    try {
      const { data: responseData, error } = await supabase.functions.invoke(
        "generate-seo-description",
        {
          body: {
            product_name: data.productName,
            keywords: data.keywords,
            product_description_raw: data.productDescriptionRaw,
          },
        },
      );

      if (error) {
        console.error("Supabase function error:", error);
        sonnerToast.error("Có lỗi xảy ra khi tạo mô tả sản phẩm", {
          description: error.message,
        });
        return;
      }

      if (responseData?.description) {
        setGeneratedDescription(responseData.description);
        sonnerToast.success("Đã tạo mô tả sản phẩm SEO thành công!");
      } else {
        sonnerToast.error("Không thể tạo mô tả sản phẩm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error generating SEO description:", error);
      sonnerToast.error("Có lỗi xảy ra khi tạo mô tả sản phẩm");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      sonnerToast.success("Đã sao chép vào clipboard");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      sonnerToast.error("Không thể sao chép");
    }
  };

  const resetForm = () => {
    form.reset();
    setGeneratedDescription("");
    setCopied(false);
  };

  return (
    <div className="container mx-auto px-4 pt-0 pb-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-chat-seo-main" />
            Tạo Mô Tả Sản Phẩm SEO Shopee
          </h1>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Tên sản phẩm (tùy chọn)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên sản phẩm..."
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Từ khóa chính và phụ (cách nhau bởi dấu phẩy){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ví dụ: áo thun nam, áo phông cotton, áo cổ tròn, áo nam cao cấp"
                          className="min-h-[80px] resize-y"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productDescriptionRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Mô tả sản phẩm thô (thông tin chi tiết, lợi ích, v.v.){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết về sản phẩm: chất liệu, màu sắc, kích thước, tính năng đặc biệt, ưu điểm, hướng dẫn sử dụng, bảo hành..."
                          className="min-h-[150px] resize-y"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base font-medium bg-chat-seo-main hover:bg-chat-seo-main/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo mô tả...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Tạo Mô Tả Sản Phẩm SEO
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="px-6 h-12"
                    disabled={isSubmitting}
                  >
                    Làm mới
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Generated Description */}
        {generatedDescription && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Mô tả sản phẩm SEO được tạo
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sao chép mô tả dưới đây để sử dụng trên Shopee
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generatedDescription}
                  readOnly
                  rows={15}
                  className="min-h-[250px] resize-y pr-12"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedDescription)}
                  className={`absolute top-2 right-2 transition-all duration-200 ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {copied ? (
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SeoProductDescriptionForm;
