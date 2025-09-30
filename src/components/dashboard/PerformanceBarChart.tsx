import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BarChartData {
  name: string;
  value: number;
}

interface PerformanceBarChartProps {
  data: BarChartData[];
  title: string;
  personnelBreakthrough?: number;
  personnelFeasible?: number;
  totalPersonnel?: number;
  onBreakthroughClick?: () => void;
  onFeasibleClick?: () => void;
}

const chartConfig = {
  value: {
    label: "Số lượng",
    color: "hsl(var(--chart-5))",
  },
  "Đột phá": {
    label: "Đột phá",
    color: "hsl(var(--chart-1))",
  },
  "Khả thi": {
    label: "Khả thi",
    color: "hsl(var(--chart-2))",
  },
  "Gần đạt": {
    label: "Gần đạt",
    color: "hsl(var(--chart-3))",
  },
  "Chưa đạt": {
    label: "Chưa đạt",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ 
  data, 
  title, 
  personnelBreakthrough = 0, 
  personnelFeasible = 0, 
  totalPersonnel = 0,
  onBreakthroughClick,
  onFeasibleClick
}) => {
  const totalValue = React.useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);
  
  const yAxisTicks = React.useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value));
    const maxTick = Math.ceil(maxValue / 10) * 10; // Round up to nearest 10
    const ticks = [];
    for (let i = 0; i <= maxTick; i += 10) {
      ticks.push(i);
    }
    return ticks;
  }, [data]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] relative">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart
                  data={data}
                  margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="15%"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 12 }} 
                    domain={[0, 'dataMax']}
                    ticks={yAxisTicks}
                    interval={0}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || 'hsl(var(--chart-5))'} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      className="fill-foreground"
                      fontSize={14}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
              {/* Y-axis Arrow */}
              <div className="absolute left-3 top-8">
                <ArrowUp className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-sm">Thống kê nhân sự</h4>
              {(personnelBreakthrough > 0 || personnelFeasible > 0) && (
                <div className="space-y-3">
                  <div 
                    className={`${onBreakthroughClick ? 'cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-2 rounded' : 'px-2 py-2'}`}
                    onClick={onBreakthroughClick}
                  >
                    <div className="text-sm text-muted-foreground">Nhân sự đạt đột phá:</div>
                    <div className="font-semibold text-green-600">
                      {personnelBreakthrough}/{totalPersonnel}
                      <span className="text-xs ml-2">({totalPersonnel > 0 ? ((personnelBreakthrough / totalPersonnel) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    {onBreakthroughClick && <div className="text-blue-600 text-xs">xem chi tiết</div>}
                  </div>
                  <div 
                    className={`${onFeasibleClick ? 'cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-2 py-2 rounded' : 'px-2 py-2'}`}
                    onClick={onFeasibleClick}
                  >
                    <div className="text-sm text-muted-foreground">Nhân sự đạt khả thi:</div>
                    <div className="font-semibold text-yellow-600">
                      {personnelFeasible}/{totalPersonnel}
                      <span className="text-xs ml-2">({totalPersonnel > 0 ? ((personnelFeasible / totalPersonnel) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    {onFeasibleClick && <div className="text-blue-600 text-xs">xem chi tiết</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-sm">Tỷ trọng shops</h4>
              <div className="space-y-2">
                {data.map((entry) => (
                  <div key={`percentage-${entry.name}`} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartConfig[entry.name as keyof typeof chartConfig]?.color }} />
                      <span className="truncate">{entry.name}</span>
                    </div>
                    <div className="font-medium">
                      {totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceBarChart;