import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid,
} from "recharts";

interface LeaderPerformance {
    leader_name: string;
    shop_count: number;
    personnel_count: number;
    breakthroughMet: number;
    feasibleMet: number;
    almostMet: number;
    notMet: number;
}

interface LeaderPerformanceDashboardProps {
  data: LeaderPerformance[];
}

const LeaderPerformanceDashboard: React.FC<LeaderPerformanceDashboardProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Hiệu suất theo Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu leader để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(leader => ({
    name: leader.leader_name,
    'Đột phá': leader.breakthroughMet,
    'Khả thi': leader.feasibleMet,
    'Gần đạt': leader.almostMet,
    'Chưa đạt': leader.notMet,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Hiệu suất theo Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Đột phá" stackId="a" fill="#10B981" />
            <Bar dataKey="Khả thi" stackId="a" fill="#F59E0B" />
            <Bar dataKey="Gần đạt" stackId="a" fill="#EF4444" />
            <Bar dataKey="Chưa đạt" stackId="a" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LeaderPerformanceDashboard;