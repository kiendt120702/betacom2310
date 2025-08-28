import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FastDeliveryTheory from "@/components/fast-delivery/FastDeliveryTheory";
import FastDeliveryCalculation from "@/components/fast-delivery/FastDeliveryCalculation";
import { BookOpen, Calculator, Truck } from "lucide-react";

const FastDeliveryPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Truck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Giao Hàng Nhanh (GHN)
          </h1>
          <p className="text-muted-foreground">
            Lý thuyết và công cụ tính toán cho tỷ lệ giao hàng nhanh.
          </p>
        </div>
      </div>

      <Tabs defaultValue="theory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="theory" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lý thuyết
          </TabsTrigger>
          <TabsTrigger value="calculation" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Công cụ lọc đơn hàng
          </TabsTrigger>
        </TabsList>
        <TabsContent value="theory" className="mt-6">
          <FastDeliveryTheory />
        </TabsContent>
        <TabsContent value="calculation" className="mt-6">
          <FastDeliveryCalculation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FastDeliveryPage;