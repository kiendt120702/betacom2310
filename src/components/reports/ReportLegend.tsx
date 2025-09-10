import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Memoized Legend Item Component
const LegendItem: React.FC<{
  color: string;
  title: string;
  description: string;
}> = React.memo(({ color, title, description }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full ${color} flex-shrink-0`}></div>
    <div>
      <span className={`font-semibold ${title === 'Xanh lá' ? 'text-green-800 dark:text-green-200' : 
        title === 'Vàng' ? 'text-yellow-800 dark:text-yellow-200' :
        title === 'Đỏ' ? 'text-red-800 dark:text-red-200' :
        'text-purple-800 dark:text-purple-200'}`}>
        {title}:
      </span>
      <span className="text-muted-foreground ml-1">
        {description}
      </span>
    </div>
  </div>
));

LegendItem.displayName = 'LegendItem';

/**
 * Memoized Legend Component - static content, không bao giờ cần re-render
 */
const ReportLegend: React.FC = React.memo(() => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Chú thích màu sắc
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <LegendItem
          color="bg-green-100 border-2 border-green-200"
          title="Xanh lá"
          description="Doanh số dự kiến > Mục tiêu đột phá"
        />
        <LegendItem
          color="bg-yellow-100 border-2 border-yellow-200"
          title="Vàng"
          description="Mục tiêu khả thi < Doanh số dự kiến < Mục tiêu đột phá"
        />
        <LegendItem
          color="bg-red-100 border-2 border-red-200"
          title="Đỏ"
          description="80% Mục tiêu khả thi < Doanh số dự kiến < 99% Mục tiêu khả thi"
        />
        <LegendItem
          color="bg-purple-100 border-2 border-purple-200"
          title="Tím"
          description="Doanh số dự kiến < 80% Mục tiêu khả thi"
        />
      </CardContent>
    </Card>
  );
});

ReportLegend.displayName = 'ReportLegend';

export default ReportLegend;