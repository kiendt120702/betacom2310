import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface TrendData {
  month: string;
  'Đột phá': number;
  'Khả thi': number;
  'Chưa đạt': number;
}

interface PerformanceTrendChartProps {
  data: TrendData[];
  title: string;
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ data, title }) => {
  const percentageData = useMemo(() => {
    if (!data) return [];
    return data.map(item => {
      const total = item['Đột phá'] + item['Khả thi'] + item['Chưa đạt'];
      if (total === 0) {
        return {
          month: item.month,
          'Đột phá': 0,
          'Khả thi': 0,
          'Chưa đạt': 0,
        };
      }
      return {
        month: item.month,
        'Đột phá': (item['Đột phá'] / total) * 100,
        'Khả thi': (item['Khả thi'] / total) * 100,
        'Chưa đạt': (item['Chưa đạt'] / total) * 100,
      };
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={percentageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(monthStr) => format(new Date(`${monthStr}-02`), "MMM yyyy", { locale: vi })}
            />
            <YAxis 
              tickFormatter={(tick) => `${tick.toFixed(0)}%`}
              domain={[0, 100]}
            />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]} />
            <Legend />
            <Line type="monotone" dataKey="Đột phá" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="Khả thi" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="Chưa đạt" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendChart;