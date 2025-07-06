import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useBulkCreateSeoKnowledge, SeoKnowledgeMutationInput } from '@/hooks/useSeoKnowledge'; // Import SeoKnowledgeMutationInput
import { Json } from '@/integrations/supabase/types';

interface RawSeoItem {
  id: string;
  content: string;
  metadata: {
    type: string;
    category: string;
    priority: string;
    product?: string;
  };
}

const rawSeoData: RawSeoItem[] = [
  { "id": "1", "content": "Công dụng, Đặc điểm sản phẩm, Điểm mạnh, điểm yếu", "metadata": { "type": "hướng dẫn", "category": "tìm hiểu sản phẩm", "priority": "high" } },
  { "id": "2", "content": "Bộ từ khóa là tất cả các từ khóa liên quan đến sản phẩm hoặc từ khóa mà khi tìm kiếm khách có thể mua sản phẩm của mình. Tìm đầy đủ nhất có thể các từ khóa có liên quan đến sản phẩm. Tìm bộ từ khóa dùng để SEO sản phẩm, chạy quảng cáo và tối ưu ads.", "metadata": { "type": "định nghĩa", "category": "nghiên cứu từ khóa", "priority": "high" } },
  { "id": "2.1", "content": "Gợi ý từ quảng cáo Shopee, Từ đồng nghĩa, Gỡ các từ khóa từ ngắn đến dài để shopee gợi ý thêm các từ khóa dài hơn, Từ khóa ngành hàng, ngách, dài, Đảo từ, sắp xếp từ, từ sai chính tả, từ không dấu, tiếng anh, Lướt các sản phẩm tương tự.", "metadata": { "type": "hướng dẫn", "category": "nghiên cứu từ khóa", "priority": "medium" } },
  { "id": "2.2", "content": "Sử dụng các công cụ như Google Keyword Planner, Ahrefs, Semrush để tìm kiếm từ khóa có dung lượng lớn và độ cạnh tranh thấp. Phân tích đối thủ để tìm từ khóa họ đang sử dụng.", "metadata": { "type": "hướng dẫn", "category": "nghiên cứu từ khóa", "priority": "medium" } },
  { "id": "2.3", "content": "Phân loại từ khóa thành các nhóm: từ khóa chính (short-tail), từ khóa dài (long-tail), từ khóa thương hiệu, từ khóa ngách. Ưu tiên từ khóa dài vì tỷ lệ chuyển đổi cao hơn.", "metadata": { "type": "hướng dẫn", "category": "nghiên cứu từ khóa", "priority": "high" } },
  { "id": "3", "content": "Tên sản phẩm là yếu tố quan trọng nhất để Shopee nhận diện sản phẩm và hiển thị trong kết quả tìm kiếm. Tên sản phẩm phải chứa từ khóa chính, dễ đọc và không vi phạm quy định của Shopee.", "metadata": { "type": "định nghĩa", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "3.1", "content": "Cấu trúc tên sản phẩm: [Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước). Ví dụ: \"Áo thun nam cotton cao cấp, màu trắng, size M-XL\".", "metadata": { "type": "quy tắc", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "3.2", "content": "Độ dài tên sản phẩm: 80-100 ký tự. Chứa từ khóa chính và các từ khóa phụ liên quan. Sắp xếp từ khóa theo dung lượng tìm kiếm giảm dần, từ khóa phổ biến đặt ở đầu.", "metadata": { "type": "quy tắc", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "3.3", "content": "Hạn chế lặp từ khóa, từ khóa ưu tiên thấp có thể ngắt ra. Dùng dấu phẩy phân tách đặc điểm, tránh ký tự đặc biệt, emoji, hashtag.", "metadata": { "type": "quy tắc", "category": "đặt tên sản phẩm", "priority": "medium" } },
  { "id": "3.4", "content": "Ví dụ 1: \"Bàn bi a mini cho bé, bida bằng gỗ, kích thước 1.2m, màu nâu\". Ví dụ 2: \"Giày thể thao nam, giày chạy bộ sneaker cao cấp, màu trắng, đế cao su chống trượt, size 40-44\".", "metadata": { "type": "ví dụ", "category": "đặt tên sản phẩm", "priority": "medium" } },
  { "id": "4", "content": "Mô tả sản phẩm là nơi để thuyết phục khách hàng mua hàng bằng cách nhấn mạnh lợi ích, đặc điểm nổi bật. Đồng thời, phủ từ khóa chính để tăng điểm SEO.", "metadata": { "type": "định nghĩa", "category": "mô tả sản phẩm", "priority": "high" } },
  { "id": "4.1", "content": "Cấu trúc mô tả: Tiêu đề sản phẩm (copy nguyên tên), Giới thiệu sản phẩm (lợi ích, công dụng, đặc điểm), Thông số kỹ thuật (kích thước, trọng lượng, chất liệu), Hướng dẫn sử dụng, Chính sách bảo hành, Hashtag.", "metadata": { "type": "quy tắc", "category": "mô tả sản phẩm", "priority": "high" } },
  { "id": "4.2", "content": "Độ dài mô tả: 2000-2500 ký tự. Mỗi từ khóa xuất hiện 1-3 lần (tối đa dưới 5 lần), tự nhiên, không nhồi nhét. Ưu tiên từ khóa có dung lượng tìm kiếm cao.", "metadata": { "type": "quy tắc", "category": "mô tả sản phẩm", "priority": "high" } },
  { "id": "4.3", "content": "Dùng gạch đầu dòng hoặc số thứ tự để chia đoạn rõ ràng. Không chứa thông tin liên lạc ngoài Shopee (số điện thoại, Zalo, website) hoặc kêu gọi giao dịch ngoài sàn.", "metadata": { "type": "quy tắc", "category": "mô tả sản phẩm", "priority": "medium" } },
  { "id": "4.4", "content": "Thông tin sản phẩm (tên, hình ảnh, thuộc tính, giá) phải trung thực, trùng khớp. Nếu là combo, liệt kê đầy đủ thông tin từng sản phẩm. Tuân thủ chính sách của Shopee về nội dung mô tả.", "metadata": { "type": "quy tắc", "category": "mô tả sản phẩm", "priority": "high" } },
  { "id": "5", "content": "System Prompt: Bạn là một chuyên gia SEO Shopee chuyên nghiệp, chuyên về việc tối ưu hóa sản phẩm trên Shopee. Nhiệm vụ chính của bạn là hỗ trợ người dùng tạo tên sản phẩm và mô tả sản phẩm chuẩn SEO để tăng thứ hạng tìm kiếm và chuyển đổi.", "metadata": { "type": "hướng dẫn", "category": "best practices", "priority": "high" } },
  { "id": "5.1", "content": "Vai trò và Chuyên môn: Chuyên gia SEO Shopee (hiểu rõ thuật toán Shopee), Người viết nội dung (tạo nội dung thuyết phục và tối ưu SEO), Cố vấn chiến lược (đưa ra lời khuyên để cải thiện hiệu quả bán hàng).", "metadata": { "type": "định nghĩa", "category": "best practices", "priority": "high" } },
  { "id": "5.2", "content": "Nguyên tắc thu thập thông tin: Luôn yêu cầu người dùng cung cấp Loại sản phẩm, Từ khóa mục tiêu (3-5 từ khóa kèm dung lượng tìm kiếm), Đặc điểm sản phẩm (Thương hiệu, chất liệu, màu sắc, kích thước, đối tượng), Thông tin bổ sung (bảo hành, combo).", "metadata": { "type": "quy tắc", "category": "best practices", "priority": "high" } },
  { "id": "5.3", "content": "Quy tắc đặt tên sản phẩm chuẩn SEO: Cấu trúc: [Loại sản phẩm] + [Đặc điểm nổi bật] + (Thương hiệu/Model, Chất liệu, Màu sắc, Đối tượng dùng, Kích thước). Độ dài: 80-100 ký tự. Ưu tiên từ khóa có dung lượng tìm kiếm cao nhất. Sắp xếp từ khóa theo thứ tự giảm dần. Dùng dấu phẩy phân tách đặc điểm. Tránh nhồi nhét từ khóa, ký tự đặc biệt, emoji, hashtag. Đảm bảo dễ đọc và tự nhiên.", "metadata": { "type": "quy tắc", "category": "best practices", "priority": "high" } },
  { "id": "5.4", "content": "Quy tắc viết mô tả sản phẩm chuẩn SEO: Cấu trúc: Tiêu đề sản phẩm (copy nguyên tên), Giới thiệu sản phẩm (lợi ích, công dụng), Thông số kỹ thuật, Hướng dẫn sử dụng, Chính sách bảo hành, Hashtag (3-5 hashtag phổ biến). Từ khóa: Mỗi từ khóa 1-3 lần (tối đa dưới 5 lần), tự nhiên, không nhồi nhét. Ưu tiên từ khóa có dung lượng tìm kiếm cao.", "metadata": { "type": "quy tắc", "category": "best practices", "priority": "high" } },
  { "id": "5.5", "content": "Những điều KHÔNG được làm trong SEO Shopee: Nhồi nhét từ khóa không tự nhiên, Sử dụng thông tin liên lạc ngoài Shopee, Kêu gọi giao dịch ngoài sàn, Sử dụng từ khóa fake/nhái, Tạo nội dung sai lệch, Sử dụng ký tự đặc biệt, emoji trong tên sản phẩm, Vi phạm chính sách của Shopee.", "metadata": { "type": "quy tắc", "category": "best practices", "priority": "high" } },
  { "id": "5.6", "content": "Những điều LUÔN phải đảm bảo: Thông tin trung thực, chính xác. Tuân thủ chính sách Shopee. Tối ưu cho thuật toán tìm kiếm. Thuyết phục khách hàng mua hàng. Dễ đọc và hiểu. Phủ từ khóa một cách tự nhiên. Cung cấp thông tin đầy đủ về sản phẩm.", "metadata": { "type": "quy tắc", "category": "best practices", "priority": "high" } }
];

const processSeoData = (data: RawSeoItem[]): SeoKnowledgeMutationInput[] => { // Explicitly type input and output
  return data.map(item => {
    const content = item.content;
    let title = content.split('.')[0].trim(); // Try to get first sentence
    if (title.length > 50 || title.length < 5) { // If too long or too short, use first few words
      title = content.split(' ').slice(0, 10).join(' ').trim();
      if (title.length === 0) { // Fallback if content is empty or just spaces
        title = `Section ${item.id}`;
      } else if (content.length > title.length) {
        title += '...';
      }
    }

    let chunkType: string | null = null; // Make it nullable
    if (item.metadata && typeof item.metadata.type === 'string') {
      switch (item.metadata.type) {
        case "hướng dẫn": chunkType = "guideline"; break;
        case "quy tắc": chunkType = "rule"; break;
        case "định nghĩa": chunkType = "definition"; break;
        case "ví dụ": chunkType = "example"; break;
        default: chunkType = "general"; // Fallback
      }
    }

    return {
      title: title,
      content: content,
      chunk_type: chunkType, // Store derived chunk_type
      section_number: String(item.id),
      word_count: content.split(' ').filter(word => word.length > 0).length,
      metadata: item.metadata as Json, // Store the entire metadata object
    };
  });
};

const seoKnowledgeData = processSeoData(rawSeoData);

const BulkSeoImport: React.FC = () => {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSeoKnowledge();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkImport = async () => {
    setIsProcessing(true);
    try {
      await bulkCreate.mutateAsync(seoKnowledgeData); // This should now be correctly typed
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Tài liệu sẽ được chia thành {seoKnowledgeData.length} chunks:</h3>
            <ul className="text-sm space-y-1">
              <li>• Các chunks về tìm hiểu sản phẩm, nghiên cứu từ khóa, đặt tên sản phẩm, mô tả sản phẩm và best practices.</li>
              <li>• Mỗi chunk tập trung vào một khía cạnh cụ thể (quy tắc, hướng dẫn, định nghĩa, ví dụ).</li>
            </ul>
          </div>
          
          <div className="bg-chat-seo-light p-4 rounded-lg">
            <h4 className="font-semibold text-chat-seo-main mb-2">Cấu trúc kiến thức bao gồm:</h4>
            <div className="text-sm text-chat-seo-main/90 space-y-1">
              <div>📝 <strong>Hướng dẫn:</strong> Các bước thực hiện, cách làm.</div>
              <div>📋 <strong>Quy tắc:</strong> Các nguyên tắc cần tuân thủ.</div>
              <div>💡 <strong>Định nghĩa:</strong> Giải thích các khái niệm.</div>
              <div>🎯 <strong>Ví dụ:</strong> Minh họa cụ thể.</div>
            </div>
          </div>

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