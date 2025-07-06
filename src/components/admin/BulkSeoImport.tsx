import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useBulkCreateSeoKnowledge } from '@/hooks/useSeoKnowledge';

const BulkSeoImport: React.FC = () => {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSeoKnowledge();
  const [isProcessing, setIsProcessing] = useState(false);

  const seoKnowledgeData = [
    {
      title: "1.1 Mục tiêu đặt tên sản phẩm",
      content: "Từ khóa chính: Mục tiêu SEO, hiển thị tìm kiếm, từ khóa Shopee\n\n• Tạo tiêu đề giúp thuật toán Shopee nhận diện và hiển thị sản phẩm trong kết quả tìm kiếm.\n• Tăng thứ hạng tìm kiếm, đặc biệt cho shop mới hoặc sản phẩm ít cạnh tranh.\n• Đảm bảo tiêu đề dễ đọc, chứa từ khóa chính, không vi phạm thuật toán (tránh nhồi nhét từ khóa).",
      chunk_type: "title_naming",
      section_number: "1.1",
      word_count: 85
    },
    {
      title: "1.2 Nhận và xử lý từ khóa",
      content: "Từ khóa chính: Từ khóa người dùng, dung lượng tìm kiếm, từ khóa Shopee\n\n• Người dùng cung cấp 3–5 từ khóa kèm dung lượng tìm kiếm (ví dụ: \"bàn bi a\" - 10,000 lượt/tháng, \"bàn bi a mini\" - 5,000 lượt/tháng).\n• Ưu tiên từ khóa có dung lượng tìm kiếm cao\n• Kết hợp từ khóa dài (long-tail keywords) để tăng tỷ lệ chuyển đổi và dễ lên top.",
      chunk_type: "keyword_structure",
      section_number: "1.2",
      word_count: 92
    },
    {
      title: "1.3 Cấu trúc và sắp xếp từ khóa",
      content: "Từ khóa chính: Cấu trúc tiêu đề, từ khóa chính, độ dài tiêu đề\n\n• Cấu trúc: Loại sản phẩm + Đặc điểm nổi bật + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước)\n• Ví dụ: \"Bàn bi a mini cho bé, bida bằng gỗ cao cấp, kích thước 1.2m\"\n• Độ dài: 80 – 100 ký tự, chứa từ khóa chính\n• Sắp xếp từ khóa theo dung lượng tìm kiếm giảm dần, từ khóa phổ biến đặt đầu\n• Hạn chế lặp từ khóa, từ khóa ưu tiên thấp có thể ngắt ra\n• Dùng dấu phẩy phân tách đặc điểm, tránh ký tự đặc biệt, emoji, hashtag.",
      chunk_type: "title_naming",
      section_number: "1.3",
      word_count: 142
    },
    {
      title: "1.4 Lưu ý khi đặt tên sản phẩm",
      content: "• Tiêu đề ưu tiên phủ từ khóa chính, dễ hiểu, không cần văn hoa.\n• Tránh nhồi nhét từ khóa hoặc dùng từ không liên quan.\n• Đảm bảo tính tự nhiên và dễ đọc của tiêu đề.\n• Tuân thủ quy định của Shopee về tên sản phẩm.",
      chunk_type: "shopee_rules",
      section_number: "1.4",
      word_count: 58
    },
    {
      title: "1.5 Ví dụ minh họa đặt tên sản phẩm",
      content: "Ví dụ 1 (3 từ khóa):\n• Từ khóa: \"bàn bi a\" (10,000 lượt), \"bàn bi a mini\" (5,000 lượt), \"bàn bi a cho bé\" (2,000 lượt)\n• Tiêu đề: \"Bàn bi a mini cho bé, bida bằng gỗ, kích thước 1.2m, màu nâu\" (82 ký tự)\n\nVí dụ 2 (5 từ khóa):\n• Từ khóa: \"giày thể thao\" (30,000 lượt), \"giày thể thao nam\" (18,000 lượt), \"giày chạy bộ\" (12,000 lượt), \"giày sneaker\" (10,000 lượt), \"giày trắng\" (6,000 lượt)\n• Tiêu đề: \"Giày thể thao nam, giày chạy bộ sneaker cao cấp, màu trắng, đế cao su chống trượt, size 40-44\" (93 ký tự)",
      chunk_type: "best_practices",
      section_number: "1.5",
      word_count: 158
    }
  ];

  const handleBulkImport = async () => {
    setIsProcessing(true);
    try {
      await bulkCreate.mutateAsync(seoKnowledgeData);
      toast({
        title: "Import thành công!",
        description: `Đã thêm ${seoKnowledgeData.length} kiến thức SEO vào hệ thống`,
      });
    } catch (error) {
      console.error('Bulk import error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-chat-seo-main" />
          Import kiến thức SEO từ tài liệu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleBulkImport}
            disabled={isProcessing || bulkCreate.isPending}
            className="w-full bg-chat-seo-main hover:bg-chat-seo-main/90"
          >
            {isProcessing || bulkCreate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý và tạo embedding...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {seoKnowledgeData.length} kiến thức SEO vào hệ thống
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSeoImport;