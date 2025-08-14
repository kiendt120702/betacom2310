
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoanhSoTable from "@/components/doanh-so/DoanhSoTable";
import DoanhSoImportDialog from "@/components/doanh-so/DoanhSoImportDialog";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";

const DoanhSoPage: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: reports, isLoading, refetch } = useComprehensiveReports();

  const handleImportSuccess = () => {
    toast({
      title: "Thành công",
      description: "Đã import dữ liệu doanh số thành công",
    });
    refetch();
    setImportDialogOpen(false);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Làm mới",
      description: "Đã cập nhật dữ liệu mới nhất",
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Xuất dữ liệu",
      description: "Tính năng xuất dữ liệu sẽ được phát triển sau",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doanh Số</h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi dữ liệu doanh số từ file Excel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dữ liệu Doanh Số</span>
            <span className="text-sm font-normal text-gray-500">
              {reports?.length || 0} bản ghi
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DoanhSoTable 
            data={reports || []} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <DoanhSoImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default DoanhSoPage;
