import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FastDeliveryTheory from "@/components/fast-delivery/FastDeliveryTheory";
import FastDeliveryCalculation from "@/components/fast-delivery/FastDeliveryCalculation";
import { BookOpen, Calculator } from "lucide-react";

const FastDeliveryPage = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculation">
            Công cụ lọc đơn hàng
          </TabsTrigger>
          <TabsTrigger value="theory" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lý thuyết
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