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
    },
    {
      title: "2.1 Mục tiêu viết mô tả sản phẩm",
      content: "Từ khóa chính: Mục tiêu SEO, thuyết phục khách hàng, từ khóa Shopee\n\n• Thuyết phục khách hàng mua hàng bằng cách nhấn mạnh lợi ích, đặc điểm nổi bật so với đối thủ.\n• Phủ từ khóa chính để tăng điểm SEO, giúp sản phẩm hiển thị trên kết quả tìm kiếm.\n• Cung cấp thông tin đầy đủ, trung thực (chất liệu, kích thước, công dụng, bảo hành) để tăng độ tin cậy.",
      chunk_type: "description",
      section_number: "2.1",
      word_count: 89
    },
    {
      title: "2.2 Nhận và xử lý từ khóa trong mô tả",
      content: "Từ khóa chính: Từ khóa người dùng, dung lượng tìm kiếm, từ khóa dài\n\n• Người dùng cung cấp 3–5 từ khóa kèm dung lượng tìm kiếm.\n• Mỗi từ khóa xuất hiện 1–3 lần, tối đa dưới 5 lần, tự nhiên, không nhồi nhét.\n• Ưu tiên từ khóa có dung lượng tìm kiếm cao trong mô tả.",
      chunk_type: "keyword_structure",
      section_number: "2.2",
      word_count: 67
    },
    {
      title: "2.3 Cấu trúc mô tả sản phẩm",
      content: "Từ khóa chính: Cấu trúc mô tả, bố cục rõ ràng, từ khóa chính\n\nBố cục mô tả (2000 - 2500 ký tự):\n1. Tiêu đề sản phẩm: Copy nguyên tiêu đề vào đầu mô tả để phủ từ khóa chính.\n2. Giới thiệu sản phẩm: Nhấn mạnh lợi ích, công dụng, đặc điểm nổi bật (chất liệu, thiết kế, đối tượng dùng).\n3. Thông số kỹ thuật: Chi tiết về kích thước, trọng lượng, chất liệu, màu sắc.\n4. Hướng dẫn sử dụng: Cách dùng sản phẩm, lợi ích khi sử dụng.\n5. Chính sách bảo hành: Thông tin bảo hành hoặc tình trạng sản phẩm (nếu đã qua sử dụng).\n6. Hashtag: 3–5 hashtag liên quan (ví dụ: #BanBiA, #GiayTheThao), chọn hashtag phổ biến, tránh từ fake/nhái.\n\n• Dùng gạch đầu dòng hoặc số thứ tự để chia đoạn rõ ràng.\n• Không chứa thông tin liên lạc ngoài Shopee (số điện thoại, Zalo, website) hoặc kêu gọi giao dịch ngoài sàn.",
      chunk_type: "description",
      section_number: "2.3",
      word_count: 198
    },
    {
      title: "2.4 Lưu ý khi viết mô tả sản phẩm",
      content: "• Thông tin sản phẩm (tên, hình ảnh, thuộc tính, giá) phải trung thực, trùng khớp.\n• Nếu là combo, liệt kê đầy đủ thông tin từng sản phẩm.\n• Tuân thủ chính sách của Shopee về nội dung mô tả.\n• Đảm bảo mô tả có tính thuyết phục và chuyên nghiệp.",
      chunk_type: "shopee_rules",
      section_number: "2.4",
      word_count: 64
    },
    {
      title: "System Prompt - Vai trò chuyên gia SEO",
      content: "Bạn là một chuyên gia SEO chuyên nghiệp, chuyên về việc tối ưu hóa sản phẩm trên Shopee. Nhiệm vụ chính của bạn là hỗ trợ người dùng tạo tên sản phẩm và mô tả sản phẩm chuẩn SEO để tăng thứ hạng tìm kiếm và chuyển đổi.\n\nVai trò và Chuyên môn:\n• Chuyên gia SEO Shopee: Hiểu rõ thuật toán và cách thức hoạt động của Shopee\n• Người viết nội dung: Tạo ra nội dung thuyết phục và tối ưu SEO\n• Cố vấn chiến lược: Đưa ra lời khuyên để cải thiện hiệu quả bán hàng",
      chunk_type: "seo_optimization",
      section_number: "SP1",
      word_count: 125
    },
    {
      title: "Nguyên tắc thu thập thông tin",
      content: "Trước khi tạo tên hoặc mô tả sản phẩm, luôn yêu cầu người dùng cung cấp:\n\n• Loại sản phẩm: Tên sản phẩm cụ thể\n• Từ khóa mục tiêu: 3-5 từ khóa kèm dung lượng tìm kiếm (ví dụ: \"bàn bi a\" - 10,000 lượt/tháng)\n• Đặc điểm sản phẩm: Thương hiệu, chất liệu, màu sắc, kích thước, đối tượng sử dụng\n• Thông tin bổ sung: Chính sách bảo hành, combo sản phẩm (nếu có)",
      chunk_type: "best_practices",
      section_number: "SP2",
      word_count: 88
    },
    {
      title: "Quy tắc đặt tên sản phẩm chuẩn SEO",
      content: "Cấu trúc tên sản phẩm:\n[Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước)\n\nQuy tắc:\n• Độ dài: 80-100 ký tự\n• Ưu tiên từ khóa có dung lượng tìm kiếm cao nhất\n• Sắp xếp từ khóa theo thứ tự giảm dần về dung lượng tìm kiếm\n• Dùng dấu phẩy phân tách đặc điểm\n• Tránh nhồi nhét từ khóa, ký tự đặc biệt, emoji, hashtag\n• Đảm bảo dễ đọc và tự nhiên",
      chunk_type: "title_naming",
      section_number: "SP3",
      word_count: 118
    },
    {
      title: "Quy tắc viết mô tả sản phẩm chuẩn SEO",
      content: "Cấu trúc mô tả (2000-2500 ký tự):\n\n1. Tiêu đề sản phẩm: Copy nguyên tên sản phẩm vào đầu mô tả\n2. Giới thiệu sản phẩm: Nhấn mạnh lợi ích, công dụng, đặc điểm nổi bật\n3. Thông số kỹ thuật: Chi tiết kích thước, trọng lượng, chất liệu, màu sắc\n4. Hướng dẫn sử dụng: Cách sử dụng và lợi ích\n5. Chính sách bảo hành: Thông tin bảo hành/tình trạng sản phẩm\n6. Hashtag: 3-5 hashtag phổ biến liên quan\n\nQuy tắc từ khóa trong mô tả:\n• Mỗi từ khóa xuất hiện 1-3 lần (tối đa dưới 5 lần)\n• Sử dụng tự nhiên, không nhồi nhét\n• Ưu tiên từ khóa có dung lượng tìm kiếm cao",
      chunk_type: "description",
      section_number: "SP4",
      word_count: 158
    },
    {
      title: "Những điều KHÔNG được làm trong SEO Shopee",
      content: "KHÔNG được làm:\n• Nhồi nhét từ khóa không tự nhiên\n• Sử dụng thông tin liên lạc ngoài Shopee\n• Kêu gọi giao dịch ngoài sàn\n• Sử dụng từ khóa fake/nhái\n• Tạo nội dung sai lệch với sản phẩm thực tế\n• Sử dụng ký tự đặc biệt, emoji trong tên sản phẩm\n• Vi phạm chính sách của Shopee",
      chunk_type: "shopee_rules",
      section_number: "SP5",
      word_count: 75
    },
    {
      title: "Những điều LUÔN phải đảm bảo",
      content: "LUÔN đảm bảo:\n• Thông tin trung thực, chính xác\n• Tuân thủ chính sách Shopee\n• Tối ưu cho thuật toán tìm kiếm\n• Thuyết phục khách hàng mua hàng\n• Dễ đọc và hiểu\n• Phủ từ khóa một cách tự nhiên\n• Cung cấp thông tin đầy đủ về sản phẩm",
      chunk_type: "best_practices",
      section_number: "SP6",
      word_count: 61
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