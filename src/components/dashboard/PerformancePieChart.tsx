import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from "recharts";

interface PieChartData {
  name: string;
  value: number;
}

interface PerformancePieChartProps {
  data: PieChartData[];
  title: string;
  onCategoryClick?: (categoryName: string) => void;
}

const COLORS: { [key: string]: string } = {
  'Đột phá': '#10B981', // green-500
  'Khả thi': '#F59E0B', // amber-500
  'Gần đạt': '#EF4444', // red-500
  'Chưa đạt': '#64748b', // slate-500
  'Chưa có mục tiêu': '#A8A29E', // stone-400
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background p-3 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-foreground">{`${data.name}`}</p>
        <p className="text-sm text-muted-foreground">
          Số lượng: <span className="font-bold text-foreground">{data.value}</span> shops
        </p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
      />
    </g>
  );
};

const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ data, title, onCategoryClick }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const totalValue = React.useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);

  if (!data || data.every(d => d.value === 0)) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, index) => onCategoryClick?.(data[index].name)}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-muted-foreground">Tổng số shop</span>
              <span className="text-3xl font-bold">{totalValue}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.map((entry) => (
              <div 
                key={`legend-${entry.name}`} 
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors"
                onClick={() => onCategoryClick?.(entry.name)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
                  <span>{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{entry.value}</span>
                  <span className="text-muted-foreground ml-2">
                    ({totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformancePieChart;