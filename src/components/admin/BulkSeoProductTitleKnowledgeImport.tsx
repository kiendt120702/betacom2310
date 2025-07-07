import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useBulkCreateSeoKnowledge, SeoKnowledgeMutationInput } from '@/hooks/useSeoKnowledge';
import { Json } from '@/integrations/supabase/types';

interface RawSeoItem {
  id: string;
  content: string;
  metadata: {
    type: string;
    category: string;
    priority: string;
  };
}

const processSeoData = (data: RawSeoItem[]): SeoKnowledgeMutationInput[] => {
  return data.map(item => {
    const content = item.content;
    
    let chunkType: string | null = null;
    if (item.metadata && typeof item.metadata.type === 'string') {
      switch (item.metadata.type) {
        case "hướng dẫn": chunkType = "guideline"; break;
        case "quy tắc": chunkType = "rule"; break;
        case "định nghĩa": chunkType = "definition"; break;
        case "ví dụ": chunkType = "example"; break;
        default: chunkType = "general"; // Fallback
      }
    }

    const metadata: Record<string, any> = {
      type: item.metadata.type,
      category: item.metadata.category,
      priority: item.metadata.priority,
    };

    return {
      content: content,
      chunk_type: chunkType,
      section_number: String(item.id),
      metadata: metadata as Json,
    };
  });
};

const seoProductTitleKnowledgeData = processSeoData([
  { "id": "1", "content": "Công dụng, Đặc điểm sản phẩm, Điểm mạnh, điểm yếu", "metadata": { "type": "hướng dẫn", "category": "tìm hiểu sản phẩm", "priority": "high" } },
  { "id": "2", "content": "Bộ từ khoá là tất cả các từ khóa liên quan đến sản phẩm hoặc từ khóa mà khi tìm kiếm khách có thể mua sản phẩm của mình. Tìm đầy đủ nhất có thể các từ khóa có liên quan đến sản phẩm. Tìm bộ từ khóa dùng để SEO sản phẩm, chạy quảng cáo và tối ưu ads", "metadata": { "type": "định nghĩa", "category": "nghiên cứu từ khóa", "priority": "high" } },
  { "id": "2.1", "content": "Gợi ý từ quảng cáo Shopee, Từ đồng nghĩa, Gõ các từ khóa từ ngắn đến dài để shopee gợi ý thêm các từ khóa dài hơn. Từ khóa ngành hàng, ngách, dải, Đảo từ, sắp xếp từ, từ sai chính tả, từ không dấu, tiếng anh, Lướt các sản phẩm tương tự", "metadata": { "type": "hướng dẫn", "category": "nghiên cứu từ khóa", "priority": "medium" } },
  { "id": "3", "content": "Công thức: Tên sản phẩm + (Thương hiệu, nếu có) + Model + Thông số kỹ thuật", "metadata": { "type": "quy tắc", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "3.1", "content": "Mục tiêu quan trọng: Tạo tiêu đề chuẩn SEO giúp thuật toán Shopee nhận diện và hiển thị sản phẩm trên kết quả tìm kiếm khi khách tìm cụ thể là cho AI của shopee có thể đọc được. Tăng thứ hạng tìm kiếm sản phẩm dựa vào các từ khoá có lượng tìm kiếm cao", "metadata": { "type": "guideline", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "3.2", "content": "Đặt tên sản phẩm dựa trên bộ từ khóa, sắp xếp theo thứ tự giảm dần lượng tìm kiếm theo nguyên tắc: Độ dài: 80 – 100 ký tự, chứa từ khóa chính. Chọn các từ khóa mình muốn tập trung và đặt tên theo các từ đó. Từ càng phổ biến càng được ưu tiên xuất hiện ở đầu. Với sản phẩm mới shop mới năng lực cạnh tranh chưa cao thì có thể chọn các từ khóa ít cạnh tranh 1 chút để tối ưu trước thì dễ lên hơn. Hạn chế bị lặp từ. Tiêu đề không cần văn hay nhưng đọc cũng không ngang quá miễn sao phủ được hết các từ khóa chính đã nghiên cứu ra. Các từ không nhất thiết tất cả phải liền nhau mà có thể các từ ưu tiên thấp sẽ bị ngắt ra. Không nhồi nhét các từ khóa không liên quan vào tên sản phẩm: Tránh tình trạng liệt kê tất cả các ưu điểm, từ khóa không liên quan hoặc spam từ khoá vào tên sản phẩm. Vì điều này sẽ làm cho Người mua cảm thấy như tên sản phẩm của Shop thiếu chuyên nghiệp và không đáng tin cậy. Chọn từ khóa ngách: Từ khóa ngách là từ khóa diễn đạt cùng chủ đề với các từ khóa chính nhưng có độ cạnh tranh thấp hơn. Ví dụ như: Từ khóa chung của mặt hàng là kem hỗ trợ trị mụn, bạn có thể tập trung cụ thể hơn vào thông tin sản phẩm như kem hỗ trợ trị mụn Hàn Quốc, kem hỗ trợ trị nám,…", "metadata": { "type": "rule", "category": "đặt tên sản phẩm", "priority": "high" } },
  { "id": "4", "content": "Các từ khóa nghiên cứu được cho sản phẩm bàn bi a mini sắp theo phổ biến giảm dần có bàn bi a, bàn bi a mini, bàn bi a cho bé, bida mini bằng gỗ thì có thể đặt tên: bàn bi a mini cho bé bida bằng gỗ", "metadata": { "type": "example", "category": "đặt tên sản phẩm", "priority": "medium" } }
]);

interface BulkSeoProductTitleKnowledgeImportProps {
  onImportSuccess: () => void;
}

const BulkSeoProductTitleKnowledgeImport: React.FC<BulkSeoProductTitleKnowledgeImportProps> = ({ onImportSuccess }) => {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSeoKnowledge();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkImport = async () => {
    setIsProcessing(true);
    try {
      await bulkCreate.mutateAsync(seoProductTitleKnowledgeData);
      toast({
        title: "Import thành công!",
        description: `Đã thêm ${seoProductTitleKnowledgeData.length} kiến thức SEO tên sản phẩm vào hệ thống`,
      });
      onImportSuccess();
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
          <FileText className="w-5 h-5 text-purple-600" />
          Import kiến thức SEO tên sản phẩm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Tài liệu sẽ được chia thành {seoProductTitleKnowledgeData.length} chunks:</h3>
            <ul className="text-sm space-y-1">
              <li>• Các chunks về tìm hiểu sản phẩm, nghiên cứu từ khóa, và đặt tên sản phẩm.</li>
              <li>• Mỗi chunk tập trung vào một khía cạnh cụ thể (quy tắc, hướng dẫn, định nghĩa, ví dụ).</li>
            </ul>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-700 mb-2">Cấu trúc kiến thức bao gồm:</h4>
            <div className="text-sm text-purple-700/90 space-y-1">
              <div>📝 <strong>Hướng dẫn:</strong> Các bước thực hiện, cách làm.</div>
              <div>📋 <strong>Quy tắc:</strong> Các nguyên tắc cần tuân thủ.</div>
              <div>💡 <strong>Định nghĩa:</strong> Giải thích các khái niệm.</div>
              <div>🎯 <strong>Ví dụ:</strong> Minh họa cụ thể.</div>
            </div>
          </div>

          <Button 
            onClick={handleBulkImport}
            disabled={isProcessing || bulkCreate.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing || bulkCreate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý và tạo embedding...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {seoProductTitleKnowledgeData.length} kiến thức SEO tên sản phẩm
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSeoProductTitleKnowledgeImport;