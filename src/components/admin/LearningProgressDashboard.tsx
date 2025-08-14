import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BookOpen, Clock, CheckCircle, Search, Users2, Eye } from "lucide-react";
import { useLearningAnalytics, formatLearningTime, UserLearningSummary } from "@/hooks/useLearningAnalytics";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Team } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import UserLearningDetailsDialog from "./UserLearningDetailsDialog";

const LearningProgressDashboard: React.FC = () => {
  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile || undefined); // Fixed: Pass undefined if null

  const { data: analyticsData, isLoading, error } = useLearningAnalytics();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!analyticsData?.users) return [];

    let filtered = analyticsData.users;

    if (!isAdmin) {
      filtered = filtered.filter(user => 
        user.id === currentUserProfile?.id || 
        (isLeader && user.team_name === currentUserProfile?.teams?.name)
      );
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (selectedTeam !== "all") {
      filtered = filtered.filter(user => user.team_name === analyticsData.teams.find(t => t.id === selectedTeam)?.name);
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    return filtered;
  }, [analyticsData, debouncedSearchTerm, selectedTeam, selectedRole, isAdmin, isLeader, currentUserProfile]);

  const handleViewDetails = (user: UserLearningSummary) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.full_name);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Tiến độ học tập</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang tải...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Đang tải danh sách người dùng...</CardTitle></CardHeader>
          <CardContent><div className="h-64 bg-muted animate-pulse rounded"></div></CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không thể tải dữ liệu phân tích học tập.</p>
      </div>
    );
  }

  const { overall, teams } = analyticsData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tiến độ học tập</h2>
      <p className="text-muted-foreground">Theo dõi tiến độ học tập của các thành viên trong hệ thống.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.total_users}</div>
            <p className="text-xs text-muted-foreground">Người dùng đã đăng ký</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài tập</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.total_unique_exercises}</div>
            <p className="text-xs text-muted-foreground">Bài tập có sẵn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thời gian học</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLearningTime(overall.total_learning_time_minutes)}</div>
            <p className="text-xs text-muted-foreground">Tổng thời gian xem video</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overall.total_exercises_completed_across_all_users}</div>
            <p className="text-xs text-muted-foreground">Bài tập đã được hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiến độ học tập của từng người dùng</CardTitle>
          <CardDescription>Theo dõi chi tiết tiến độ của mỗi thành viên.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lọc theo Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Team</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lọc theo Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="chuyên viên">Chuyên viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Bài tập hoàn thành</TableHead>
                  <TableHead className="text-center">Tiến độ</TableHead>
                  <TableHead className="text-center">Thời gian học</TableHead>
                  <TableHead className="text-center">Video ôn tập</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.team_name || "N/A"}</TableCell>
                      <TableCell className="text-center">{user.completed_exercises}/{user.total_exercises}</TableCell>
                      <TableCell className="w-[150px]">
                        <Progress value={user.completion_percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground">{user.completion_percentage}%</span>
                      </TableCell>
                      <TableCell className="text-center">{formatLearningTime(user.total_time_spent_minutes)}</TableCell>
                      <TableCell className="text-center">{user.video_reviews_submitted}/{user.required_video_reviews}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy người dùng nào phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <UserLearningDetailsDialog
        userId={selectedUserId}
        userName={selectedUserName}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default LearningProgressDashboard;