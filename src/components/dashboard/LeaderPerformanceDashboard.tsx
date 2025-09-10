import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown } from "lucide-react";

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

interface LeaderPerformanceDashboardProps {
  data: LeaderPerformance[];
}

const LeaderPerformanceDashboard: React.FC<LeaderPerformanceDashboardProps> = ({
  data,
}) => {
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
          <p className="text-muted-foreground">
            Không có dữ liệu leader để hiển thị.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Hiệu suất theo Leader
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leader</TableHead>
                <TableHead className="text-center">Shop</TableHead>
                <TableHead className="text-center">Nhân sự</TableHead>
                <TableHead className="text-center text-green-600">
                  Đạt đột phá
                </TableHead>
                <TableHead className="text-center text-blue-600">
                  Đạt khả thi
                </TableHead>
                <TableHead className="text-center text-orange-600">
                  {" "}
                  Trên 80% khả thi
                </TableHead>
                <TableHead className="text-center text-red-600">
                  Chưa đạt 80% khả thi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((leader) => (
                <TableRow key={leader.leader_name}>
                  <TableCell className="font-medium">
                    {leader.leader_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {leader.shop_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {leader.personnel_count}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-green-600">
                    {leader.breakthroughMet}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-blue-600">
                    {leader.feasibleMet + leader.breakthroughMet}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-orange-600">
                    {leader.almostMet}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-red-600">
                    {leader.notMet}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderPerformanceDashboard;
