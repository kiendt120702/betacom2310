import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, Download, Calendar, TrendingUp } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ComprehensiveReportsTable from "@/components/reports/ComprehensiveReportsTable";
import ReportImportDialog from "@/components/reports/ReportImportDialog";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ComprehensiveReportsPage: React.FC = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const { data: reports, isLoading: reportsLoading, refetch } = useComprehensiveReports();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chỉ admin và leader mới có thể truy cập
  if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "leader")) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = userProfile.role === "admin";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Báo Cáo Tổng Hợp</h1>
            <p className="text-muted-foreground">Phân tích dữ liệu kinh doanh toàn diện</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <Button 
              onClick={() => setIsImportDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
          )}
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh số</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.reduce((sum, r) => sum + (r.total_revenue || 0), 0).toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.reduce((sum, r) => sum + (r.total_orders || 0), 0).toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-muted-foreground">
              +180.1% từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports && reports.length > 0 
                ? ((reports.reduce((sum, r) => sum + (r.conversion_rate || 0), 0) / reports.length) * 100).toFixed(2)
                : '0.00'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              +19% từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người mua</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.reduce((sum, r) => sum + (r.total_buyers || 0), 0).toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-muted-foreground">
              +201 kể từ tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Bảng dữ liệu</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dữ liệu báo cáo tổng hợp</CardTitle>
              <CardDescription>
                Dữ liệu chi tiết theo từng ngày với các chỉ số kinh doanh quan trọng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Đang tải dữ liệu...</span>
                </div>
              ) : (
                <ComprehensiveReportsTable 
                  reports={reports || []} 
                  onRefresh={refetch}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích xu hướng</CardTitle>
              <CardDescription>
                Biểu đồ và phân tích chi tiết về hiệu suất kinh doanh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tính năng phân tích đang được phát triển</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <ReportImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={() => {
          refetch();
          setIsImportDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ComprehensiveReportsPage;