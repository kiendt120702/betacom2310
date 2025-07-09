import React from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';

interface KnowledgeBaseHeaderProps {
  nullEmbeddingCount: number;
  onRegenerateEmbeddings: () => void;
  isRegenerating: boolean;
  onCreateClick: () => void;
  onExportCsv: () => void;
}

const KnowledgeBaseHeader: React.FC<KnowledgeBaseHeaderProps> = ({
  nullEmbeddingCount,
  onRegenerateEmbeddings,
  isRegenerating,
  onCreateClick,
  onExportCsv,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Knowledge Base</h2>
        <p className="text-muted-foreground mt-2">
          Quản lý cơ sở kiến thức chiến lược marketing
          {nullEmbeddingCount > 0 && (
            <span className="text-orange-600 font-medium">
              {' '}• {nullEmbeddingCount} chiến lược chưa có embedding
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        {nullEmbeddingCount > 0 && (
          <Button
            onClick={onRegenerateEmbeddings}
            disabled={isRegenerating}
            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
          >
            {isRegenerating ? 'Đang tạo embedding...' : `Tạo lại ${nullEmbeddingCount} embedding`}
          </Button>
        )}

        <DialogTrigger asChild>
          <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Thêm kiến thức
          </Button>
        </DialogTrigger>

        <Button variant="outline" onClick={onExportCsv} className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeBaseHeader;