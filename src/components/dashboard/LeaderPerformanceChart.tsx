import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Crown, Users, Store, Award } from "lucide-react";

interface LeaderPerformance {
  leader_name: string;
  shop_count: number;
  personnel_count: number;
  breakthroughMet: number;
  feasibleMet: number;
  almostMet: number;
  notMet: number;
  withoutGoals: number;
}

interface LeaderPerformanceChartProps {
  data: LeaderPerformance[];
}

const COLORS = {
  'Đột phá': '#10B981',
  'Khả thi': '#F59E0B', 
  'Gần đạt': '#EF4444',
  'Chưa đạt': '#8B5CF6',
  'Chưa điền': '#A8A29E',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <p className="font-semibold text-sm">{`${data.name}`}</p>
        </div>
        <p className="text-xs text-gray-300 mt-1">
          Số lượng: <span className="font-bold text-white">{data.value}</span> shops
        </p>
      </div>
    );
  }
  return null;
};

const LeaderPerformanceChart: React.FC<LeaderPerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Biểu đồ hiệu suất theo Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu leader để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Biểu đồ hiệu suất theo Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {data.map((leader) => {
            const pieData = [
              { name: 'Đột phá', value: leader.breakthroughMet },
              { name: 'Khả thi', value: leader.feasibleMet },
              { name: 'Gần đạt', value: leader.almostMet },
              { name: 'Chưa đạt', value: leader.notMet },
              { name: 'Chưa điền', value: leader.withoutGoals },
            ].filter(item => item.value > 0);

            const totalShops = leader.shop_count;
            const breakthroughPersonnel = leader.breakthroughMet; // Personnel có shop đạt đột phá

            return (
              <div key={leader.leader_name} className="border rounded-lg p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Leader Info & Stats */}
                  <div className="lg:w-1/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{leader.leader_name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Store className="h-4 w-4 text-blue-600" />
                          <span>Tổng shop: <strong>{totalShops}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-green-600" />
                          <span>Nhân sự: <strong>{leader.personnel_count}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span>Đạt đột phá: <strong className="text-green-600">{leader.breakthroughMet}/{totalShops}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span>Đạt khả thi: <strong className="text-yellow-600">{leader.feasibleMet + leader.breakthroughMet}/{totalShops}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="lg:w-1/3 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="80%"
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend with Percentages */}
                  <div className="lg:w-1/3 space-y-2">
                    {pieData.map((entry) => (
                      <div key={`legend-${entry.name}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
                          <span>{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{entry.value}</span>
                          <span className="text-muted-foreground ml-2">
                            ({totalShops > 0 ? ((entry.value / totalShops) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderPerformanceChart;