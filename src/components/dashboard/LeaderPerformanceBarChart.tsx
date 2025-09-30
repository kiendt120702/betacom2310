import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, Crown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface LeaderPerformance {
  leader_name: string;
  shop_count: number;
  personnel_count: number;
  personnelBreakthrough: number;
  personnelFeasible: number;
  breakthroughMet: number;
  feasibleMet: number;
  almostMet: number;
  notMet: number;
  withoutGoals: number;
}

interface LeaderPerformanceBarChartProps {
  data: LeaderPerformance[];
  onBreakthroughClick?: (leaderName: string) => void;
  onFeasibleClick?: (leaderName: string) => void;
}

const chartConfig = {
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

const LeaderPerformanceBarChart: React.FC<LeaderPerformanceBarChartProps> = ({ 
  data, 
  onBreakthroughClick,
  onFeasibleClick
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Biểu đồ hiệu suất theo Leader
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu leader để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter valid leaders
  const validLeaders = data.filter((leader) => 
    leader.leader_name && 
    leader.leader_name.trim() !== "" && 
    leader.leader_name.toLowerCase() !== "chưa có leader" &&
    (leader.breakthroughMet > 0 || leader.feasibleMet > 0 || leader.almostMet > 0 || leader.notMet > 0)
  );

  // Transform data for grouped bar chart - each leader shows breakdown by performance
  const chartData = validLeaders.map((leader) => ({
    name: leader.leader_name,
    "Đột phá": leader.breakthroughMet,
    "Khả thi": leader.feasibleMet,
    "Gần đạt": leader.almostMet,
    "Chưa đạt": leader.notMet,
  }));
  
  const yAxisTicks = React.useMemo(() => {
    const maxValue = Math.max(...chartData.flatMap(d => [
      d["Đột phá"], d["Khả thi"], d["Gần đạt"], d["Chưa đạt"]
    ]));
    const maxTick = Math.ceil(maxValue / 10) * 10; // Round up to nearest 10
    const ticks = [];
    for (let i = 0; i <= maxTick; i += 10) {
      ticks.push(i);
    }
    return ticks;
  }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Biểu đồ hiệu suất theo Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart Section */}
          <div className="h-[400px] relative">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  dataKey="Đột phá" 
                  fill="var(--color-Đột phá)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList position="top" offset={4} className="fill-foreground" fontSize={10} />
                </Bar>
                <Bar 
                  dataKey="Khả thi" 
                  fill="var(--color-Khả thi)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList position="top" offset={4} className="fill-foreground" fontSize={10} />
                </Bar>
                <Bar 
                  dataKey="Gần đạt" 
                  fill="var(--color-Gần đạt)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList position="top" offset={4} className="fill-foreground" fontSize={10} />
                </Bar>
                <Bar 
                  dataKey="Chưa đạt" 
                  fill="var(--color-Chưa đạt)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList position="top" offset={4} className="fill-foreground" fontSize={10} />
                </Bar>
              </BarChart>
            </ChartContainer>
            {/* Y-axis Arrow */}
            <div className="absolute left-3 top-8">
              <ArrowUp className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          {/* Leader Details Below Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-4 text-sm">Chi tiết từng Leader</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {validLeaders.map((leader) => (
                <div key={leader.leader_name} className="text-sm border border-muted rounded-lg p-3 bg-background">
                  <div className="font-medium mb-2 text-center">{leader.leader_name}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đột phá:</span>
                      <span className="font-semibold text-green-600">{leader.breakthroughMet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Khả thi:</span>
                      <span className="font-semibold text-yellow-600">{leader.feasibleMet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gần đạt:</span>
                      <span className="font-semibold text-red-600">{leader.almostMet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chưa đạt:</span>
                      <span className="font-semibold text-slate-600">{leader.notMet}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-muted">
                      <span className="text-muted-foreground">Tổng:</span>
                      <span className="font-semibold">{leader.shop_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderPerformanceBarChart;