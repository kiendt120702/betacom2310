
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useSalesReports } from "@/hooks/useSalesReports";
import { useShops } from "@/hooks/useShops";
import { useLeaders } from "@/hooks/useLeaders";
import { usePersonnel } from "@/hooks/usePersonnel";
import SalesReportTable from "./SalesReportTable";
import LeaderManagement from "./LeaderManagement";
import PersonnelManagement from "./PersonnelManagement";
import ShopManagement from "./ShopManagement";
import ExcelUploadDialog from "./ExcelUploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SalesReportPage = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: salesReports, isLoading: loadingSales } = useSalesReports();
  const { data: shops, isLoading: loadingShops } = useShops();
  const { data: leaders, isLoading: loadingLeaders } = useLeaders();
  const { data: personnel, isLoading: loadingPersonnel } = usePersonnel();

  const isLoading = loadingSales || loadingShops || loadingLeaders || loadingPersonnel;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo cáo tổng hợp</h1>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Excel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          <TabsTrigger value="shops">Quản lý Shop</TabsTrigger>
          <TabsTrigger value="personnel">Quản lý Nhân sự</TabsTrigger>
          <TabsTrigger value="leaders">Quản lý Leader</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo doanh số</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesReportTable 
                salesReports={salesReports || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shops" className="mt-6">
          <ShopManagement 
            shops={shops || []}
            personnel={personnel || []}
            leaders={leaders || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <PersonnelManagement 
            personnel={personnel || []}
            leaders={leaders || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="leaders" className="mt-6">
          <LeaderManagement 
            leaders={leaders || []}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <ExcelUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        shops={shops || []}
      />
    </div>
  );
};

export default SalesReportPage;
