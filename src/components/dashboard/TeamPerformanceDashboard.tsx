import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface TeamPerformance {
    team_name: string;
    shop_count: number;
    personnel_count: number;
    breakthroughMet: number;
    feasibleMet: number;
    almostMet: number;
    notMet: number;
}

interface TeamPerformanceDashboardProps {
  data: TeamPerformance[];
}

const TeamPerformanceDashboard: React.FC<TeamPerformanceDashboardProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hiệu suất theo Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu team để hiển thị.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Hiệu suất theo Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Số Shop</TableHead>
                <TableHead className="text-center">Số nhân sự</TableHead>
                <TableHead className="text-center text-green-600">Đột phá</TableHead>
                <TableHead className="text-center text-yellow-600">Khả thi</TableHead>
                <TableHead className="text-center text-orange-600">Gần đạt</TableHead>
                <TableHead className="text-center text-red-600">Chưa đạt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((team) => (
                <TableRow key={team.team_name}>
                  <TableCell className="font-medium">{team.team_name}</TableCell>
                  <TableCell className="text-center">{team.shop_count}</TableCell>
                  <TableCell className="text-center">{team.personnel_count}</TableCell>
                  <TableCell className="text-center font-semibold text-green-600">{team.breakthroughMet}</TableCell>
                  <TableCell className="text-center font-semibold text-yellow-600">{team.feasibleMet}</TableCell>
                  <TableCell className="text-center font-semibold text-orange-600">{team.almostMet}</TableCell>
                  <TableCell className="text-center font-semibold text-red-600">{team.notMet}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceDashboard;