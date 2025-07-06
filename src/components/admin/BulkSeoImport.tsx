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
    "id": "1.1",
    "content": "1. Tìm hiểu chi tiết thông tin của sản phẩm • Công dụng • Đặc điểm sản phẩm • Điểm mạnh, điểm yếu",
    "metadata": {
      "type": "hướng dẫn",
      "category": "tìm hiểu sản phẩm",
      "priority": "high"
    }
  },
  {
    "id": "2.1",
    "content": "2. Nghiên cứu bộ từ khoá sản phẩm Định nghĩa: Bộ từ khoá là tất cả các từ khóa liên quan đến sản phẩm hoặc từ khóa mà khi tìm kiếm khách có thể mua sản phẩm của mình.",
    "metadata": {
      "type": "định nghĩa",
      "category": "nghiên cứu từ khóa",
      "priority": "high"
    }
  },
  {
    "id": "2.2",
    "content": "• Tìm đầy đủ nhất có thể các từ khóa có liên quan đến sản phẩm • Tìm bộ từ khóa dùng để SEO sản phẩm, chạy quảng cáo và tối ưu ads",
    "metadata": {
      "type": "quy tắc",
      "category": "nghiên cứu từ khóa",
      "priority": "high"
    }
  },
  {
    "id": "2.3",
    "content": "Cách tìm từ khóa: • Gợi ý từ quảng cáo Shopee • Từ đồng nghĩa • Gõ các từ khóa từ ngắn đến dài để shopee gợi ý thêm các từ khóa dài hơn.",
    "metadata": {
      "type": "hướng dẫn",
      "category": "nghiên cứu từ khóa",
      "priority": "medium"
    }
  },
  {
    "id": "2.4",
    "content": "• Từ khóa ngành hàng, ngách, dải • Đảo từ, sắp xếp từ, từ sai chính tả, từ không dấu, tiếng anh • Lướt các sản phẩm tương tự",
    "metadata": {
      "type": "hướng dẫn",
      "category": "nghiên cứu từ khóa",
      "priority": "medium"
    }
  },
  {
    "id": "3.1",
    "content": "3. Sửa tên sản phẩm chuẩn SEO Công thức: Tên sản phẩm + (Thương hiệu, nếu có) + Model + Thông số kỹ thuật",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "high"
    }
  },
  {
    "id": "3.2",
    "content": "Mục tiêu quan trọng: • Tạo tiêu đề chuẩn SEO giúp thuật toán Shopee nhận diện và hiển thị sản phẩm trên kết quả tìm kiếm khi khách tìm cụ thể là cho AI của shopee có thể đọc được",
    "metadata": {
      "type": "mục tiêu",
      "category": "đặt tên sản phẩm",
      "priority": "high"
    }
  },
  {
    "id": "3.3",
    "content": "• Tăng thứ hạng tìm kiếm sản phẩm dựa vào các từ khoá có lượng tìm kiếm cao Đặt tên sản phẩm dựa trên bộ từ khóa, sắp xếp theo thứ tự giảm dần lượng tìm kiếm theo nguyên tắc: - Độ dài: 80 – 100 ký tự, chứa từ khóa chính.",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "high"
    }
  },
  {
    "id": "3.4",
    "content": "• Chọn các từ khóa mình muốn tập trung và đặt tên theo các từ đó. • Từ càng phổ biến càng được ưu tiên xuất hiện ở đầu • Với sản phẩm mới shop mới năng lực cạnh tranh chưa cao thì có thể chọn các từ khóa ít cạnh tranh 1 chút để tối ưu trước thì dễ lên hơn",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "medium"
    }
  },
  {
    "id": "3.5",
    "content": "• Hạn chế bị lặp từ • Tiêu đề không cần văn hay nhưng đọc cũng không ngang quá miễn sao phủ được hết các từ khóa chính đã nghiên cứu ra.",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "medium"
    }
  },
  {
    "id": "3.6",
    "content": "• Các từ không nhất thiết tất cả phải liền nhau mà có thể các từ ưu tiên thấp sẽ bị ngắt ra • Không nhồi nhét các từ khóa không liên quan vào tên sản phẩm: Tránh tình trạng liệt kê tất cả các ưu điểm, từ khóa không liên quan hoặc spam từ khoá vào tên sản phẩm.",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "medium"
    }
  },
  {
    "id": "3.7",
    "content": "Vì điều này sẽ làm cho Người mua cảm thấy như tên sản phẩm của Shop thiếu chuyên nghiệp và không đáng tin cậy. • Chọn từ khóa ngách: Từ khóa ngách là từ khóa diễn đạt cùng chủ đề với các từ khóa chính nhưng có độ cạnh tranh thấp hơn.",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "medium"
    }
  },
  {
    "id": "3.8",
    "content": "Ví dụ như: Từ khóa chung của mặt hàng là kem hỗ trợ trị mụn, bạn có thể tập trung cụ thể hơn vào thông tin sản phẩm như kem hỗ trợ trị mụn Hàn Quốc, kem hỗ trợ trị nám,…",
    "metadata": {
      "type": "quy tắc",
      "category": "đặt tên sản phẩm",
      "priority": "medium"
    }
  },
  {
    "id": "4.1",
    "content": "4. Ví dụ Các từ khóa nghiên cứu được cho sản phẩm bàn bi a mini sắp theo phổ biến giảm dần có 'bàn bi a', 'bàn bi a mini', 'bàn bi a cho bé', 'bida mini bằng gỗ' thì có thể đặt tên: 'bàn bi a mini cho bé bida bằng gỗ'",
    "metadata": {
      "type": "ví dụ",
      "product": "bàn bi a",
      "category": "đặt tên sản phẩm",
      "priority": "low"
    }
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