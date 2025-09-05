import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";
import { ArrowUp } from "lucide-react";

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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="15%"
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
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      style={{ 
                        fill: '#374151', 
                        fontSize: '14px', 
                        fontWeight: '600' 
                      }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
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