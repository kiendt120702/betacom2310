import React from 'react';
import AverageRatingCalculator from '@/components/product-post/AverageRatingCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const AverageRatingCalculatorPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            Công Cụ Tính Điểm Đánh Giá Trung Bình
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AverageRatingCalculator />
        </CardContent>
      </Card>
    </div>
  );
};

export default AverageRatingCalculatorPage;