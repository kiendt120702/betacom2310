
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStrategyKnowledge } from '@/hooks/useStrategyKnowledge';
import { useBatchEmbedSeo } from '@/hooks/useSeoKnowledge';
import { Loader2, Database, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BatchEmbeddingTools = () => {
  const { toast } = useToast();
  const { batchEmbedding: batchEmbedStrategy } = useStrategyKnowledge();
  const batchEmbedSeo = useBatchEmbedSeo();

  const handleBatchEmbedStrategy = async () => {
    try {
      batchEmbedStrategy.mutate();
    } catch (error) {
      console.error('Error batch embedding strategy:', error);
    }
  };

  const handleBatchEmbedSeo = async () => {
    try {
      batchEmbedSeo.mutate(undefined, {
        onSuccess: (data) => {
          toast({
            title: "Thành công",
            description: `Đã tạo embedding cho ${data.processed} tài liệu SEO`,
          });
        },
        onError: (error) => {
          toast({
            title: "Lỗi",
            description: "Không thể tạo embedding SEO. Vui lòng thử lại.",
            variant: "destructive",
          });
          console.error('Error batch embedding SEO:', error);
        }
      });
    } catch (error) {
      console.error('Error batch embedding SEO:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Tạo Embedding Kiến Thức Tư Vấn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Tạo vector embedding cho tất cả tài liệu kiến thức tư vấn chiến lược chưa có embedding.
          </p>
          <Button 
            onClick={handleBatchEmbedStrategy}
            disabled={batchEmbedStrategy.isPending}
            className="w-full"
          >
            {batchEmbedStrategy.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Tạo Embedding Tư Vấn
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Tạo Embedding Kiến Thức SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Tạo vector embedding cho tất cả tài liệu kiến thức SEO Shopee chưa có embedding.
          </p>
          <Button 
            onClick={handleBatchEmbedSeo}
            disabled={batchEmbedSeo.isPending}
            className="w-full"
            variant="outline"
          >
            {batchEmbedSeo.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Tạo Embedding SEO
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchEmbeddingTools;
