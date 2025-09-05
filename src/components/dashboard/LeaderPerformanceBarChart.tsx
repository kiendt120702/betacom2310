import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";
import { ArrowUp, Crown } from "lucide-react";

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

const COLORS: { [key: string]: string } = {
  'Đột phá': '#10B981', // green-500
  'Khả thi': '#F59E0B', // amber-500
  'Gần đạt': '#EF4444', // red-500
  'Chưa đạt': '#64748b', // slate-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
          <p className="font-semibold text-sm">{label}</p>
        </div>
        <p className="text-xs text-gray-300 mt-1">
          Số lượng: <span className="font-bold text-white">{data.value}</span> shops
        </p>
      </div>
    );
  }
  return null;
};

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
  
  const totalBreakthroughShops = validLeaders.reduce((sum, leader) => sum + leader.breakthroughMet, 0);
  const totalFeasibleShops = validLeaders.reduce((sum, leader) => sum + leader.feasibleMet, 0);
  const totalAlmostShops = validLeaders.reduce((sum, leader) => sum + leader.almostMet, 0);
  const totalNotMetShops = validLeaders.reduce((sum, leader) => sum + leader.notMet, 0);
  const totalPersonnelBreakthrough = validLeaders.reduce((sum, leader) => sum + leader.personnelBreakthrough, 0);
  const totalPersonnelFeasible = validLeaders.reduce((sum, leader) => sum + leader.personnelFeasible, 0);
  const totalPersonnel = validLeaders.reduce((sum, leader) => sum + leader.personnel_count, 0);

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 20, bottom: 80 }}
                barCategoryGap="20%"
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  domain={[0, 'dataMax']}
                  ticks={yAxisTicks}
                  interval={0}
                  axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar 
                  dataKey="Đột phá" 
                  fill={COLORS['Đột phá']}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="Đột phá" 
                    position="top" 
                    style={{ fill: '#374151', fontSize: '10px', fontWeight: '600' }} 
                  />
                </Bar>
                <Bar 
                  dataKey="Khả thi" 
                  fill={COLORS['Khả thi']}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="Khả thi" 
                    position="top" 
                    style={{ fill: '#374151', fontSize: '10px', fontWeight: '600' }} 
                  />
                </Bar>
                <Bar 
                  dataKey="Gần đạt" 
                  fill={COLORS['Gần đạt']}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="Gần đạt" 
                    position="top" 
                    style={{ fill: '#374151', fontSize: '10px', fontWeight: '600' }} 
                  />
                </Bar>
                <Bar 
                  dataKey="Chưa đạt" 
                  fill={COLORS['Chưa đạt']}
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList 
                    dataKey="Chưa đạt" 
                    position="top" 
                    style={{ fill: '#374151', fontSize: '10px', fontWeight: '600' }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Y-axis Arrow */}
            <div className="absolute left-3 top-8">
              <ArrowUp className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          {/* Legend */}
          <div className="bg-muted/20 rounded-lg p-4 border border-muted">
            <h4 className="font-semibold mb-3 text-sm text-center">Ghi chú màu sắc hiệu suất</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="font-medium">
                    {key}
                  </span>
                </div>
              ))}
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