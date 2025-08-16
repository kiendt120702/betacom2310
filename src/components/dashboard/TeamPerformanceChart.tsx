import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export interface TeamPerformanceData {
  teamName: string;
  'Đột phá': number;
  'Khả thi': number;
  'Chưa đạt': number;
}

interface TeamPerformanceChartProps {
  data: TeamPerformanceData[];
  title: string;
}

const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ data, title }) => {
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
          <BarChart data={data} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="category" dataKey="teamName" />
            <YAxis type="number" tickFormatter={(tick) => `${tick * 100}%`} />
            <Tooltip formatter={(value, name, props) => {
              const total = props.payload['Đột phá'] + props.payload['Khả thi'] + props.payload['Chưa đạt'];
              const numericValue = Number(value);
              const percentage = total > 0 ? ((numericValue / total) * 100).toFixed(1) : 0;
              return [`${value} shops (${percentage}%)`, name];
            }} />
            <Legend />
            <Bar dataKey="Đột phá" stackId="a" fill="#10B981" />
            <Bar dataKey="Khả thi" stackId="a" fill="#F59E0B" />
            <Bar dataKey="Chưa đạt" stackId="a" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceChart;