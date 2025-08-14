
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
  formattedRevenue: string;
}

interface RevenueChartProps {
  data: RevenueData[];
  title: string;
  type?: "bar" | "line";
}

const RevenueChart = ({ data, title, type = "bar" }: RevenueChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const Chart = type === "bar" ? BarChart : LineChart;
  const ChartElement = type === "bar" ? Bar : Line;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "bar" ? <TrendingUp className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Doanh số"]}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              {type === "bar" ? (
                <Bar dataKey="revenue" fill="#3b82f6" />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              )}
            </Chart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
