import React from 'react';
import { Search, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface KnowledgeBaseFiltersAndImportProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  csvFile: File | null;
  onCsvFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBulkImport: () => void;
  isBulkImporting: boolean;
}

const KnowledgeBaseFiltersAndImport: React.FC<KnowledgeBaseFiltersAndImportProps> = ({
  searchTerm,
  onSearchChange,
  csvFile,
  onCsvFileChange,
  onBulkImport,
  isBulkImporting,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mt-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Tìm kiếm kiến thức..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 bg-background border-border text-foreground"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="file"
          accept=".csv"
          onChange={onCsvFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button variant="outline" className="cursor-pointer w-full sm:w-auto" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </span>
          </Button>
        </label>
        {csvFile && (
          <Button
            onClick={onBulkImport}
            disabled={isBulkImporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            {isBulkImporting ? 'Đang import...' : 'Xác nhận import'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseFiltersAndImport;