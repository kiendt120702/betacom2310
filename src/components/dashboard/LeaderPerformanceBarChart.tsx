import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Crown } from "lucide-react";

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
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span> shops
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LeaderPerformanceBarChart: React.FC<LeaderPerformanceBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            So sánh hiệu suất Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu leader để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for grouped bar chart
  const chartData = data
    .sort((a, b) => (b.breakthroughMet + b.feasibleMet) - (a.breakthroughMet + a.feasibleMet))
    .map(leader => ({
      name: leader.leader_name.length > 12 ? leader.leader_name.substring(0, 12) + "..." : leader.leader_name,
      fullName: leader.leader_name,
      "Đột phá": leader.breakthroughMet,
      "Khả thi": leader.feasibleMet,
      "Gần đạt": leader.almostMet,
      "Chưa đạt": leader.notMet,
      "Chưa điền": leader.withoutGoals,
      totalShops: leader.shop_count,
      personnelCount: leader.personnel_count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          So sánh hiệu suất Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={11}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                fontSize={11}
                tick={{ fill: '#666' }}
                label={{ value: 'Số lượng shops', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar dataKey="Đột phá" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Khả thi" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Gần đạt" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Chưa đạt" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Chưa điền" stackId="a" fill="#A8A29E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Quick stats summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
          {chartData.slice(0, 6).map(leader => {
            const successRate = leader.totalShops > 0 ? ((leader["Đột phá"] + leader["Khả thi"]) / leader.totalShops * 100) : 0;
            return (
              <div key={leader.fullName} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="font-semibold text-xs mb-1" title={leader.fullName}>{leader.name}</div>
                <div className="text-lg font-bold text-green-600">{successRate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">{leader.totalShops} shops</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderPerformanceBarChart;