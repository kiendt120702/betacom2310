import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Users, 
  BookOpen,
  PlayCircle,
  FileText,
  Brain,
  Video,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailedUserProgress, ExerciseProgressDetail } from "@/hooks/useDetailedLearningProgress";
import { useVideoProgressWithRequirements } from "@/hooks/useVideoProgressWithRequirements";
import { formatProgressTime } from "@/utils/videoTimeUtils";

interface LearningProgressTableProps {
  users: DetailedUserProgress[];
  teams: { id: string; name: string }[];
  isLoading?: boolean;
}

const ProgressIcon = ({ completed, className }: { completed: boolean; className?: string }) => {
  return completed ? (
    <CheckCircle2 className={cn("w-4 h-4 text-green-500", className)} />
  ) : (
    <Circle className={cn("w-4 h-4 text-gray-300", className)} />
  );
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}p`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}p` : ''}`;
};

const getRoleColor = (role: string): string => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'leader':
      return 'bg-blue-100 text-blue-800';
    case 'trưởng phòng':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const LearningProgressTable: React.FC<LearningProgressTableProps> = ({ 
  users, 
  teams, 
  isLoading 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string>("all");

  // Get video progress data for all users
  const { data: videoProgressData } = useVideoProgressWithRequirements("some-exercise-id"); // Pass a dummy ID or handle differently

  // Helper function to get video progress for a specific user and exercise
  const getVideoProgress = (userId: string, exerciseId: string) => {
    if (!videoProgressData) return null;
    // This logic needs adjustment if the hook fetches for a single exercise
    // For now, we assume it might contain data for the user if the hook is adapted
    return (videoProgressData as any)?.user_id === userId ? videoProgressData : null;
  };

  // Get all unique exercises from users data
  const allExercises = useMemo(() => {
    if (!users.length) return [];
    return users[0]?.exercises || [];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesTeam = selectedTeam === "all" || 
        (selectedTeam === "no-team" && !user.team_name) ||
        user.team_name === selectedTeam;
      
      const matchesSearch = !searchTerm || 
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTeam && matchesSearch;
    });
  }, [users, selectedTeam, searchTerm]);

  const getExerciseStats = (exercise: ExerciseProgressDetail, users: DetailedUserProgress[]) => {
    const totalUsers = users.length;
    if (totalUsers === 0) return { completed: 0, percentage: 0 };
    
    const completedCount = users.filter(user => 
      user.exercises.find(ex => ex.exercise_id === exercise.exercise_id)?.is_completed
    ).length;
    
    return {
      completed: completedCount,
      percentage: Math.round((completedCount / totalUsers) * 100)
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng học viên</p>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng bài tập</p>
                <p className="text-2xl font-bold">{allExercises.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Hoàn thành trung bình</p>
                <p className="text-2xl font-bold">
                  {filteredUsers.length > 0 ? Math.round(
                    filteredUsers.reduce((acc, user) => 
                      acc + user.exercises.filter(ex => ex.is_completed).length, 0
                    ) / filteredUsers.length
                  ) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Thời gian học</p>
                <p className="text-2xl font-bold">
                  {formatTime(
                    filteredUsers.reduce((acc, user) => 
                      acc + user.exercises.reduce((exerciseAcc, ex) => 
                        exerciseAcc + ex.time_spent_minutes, 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả team</SelectItem>
            <SelectItem value="no-team">Chưa có team</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.name}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn bài tập" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bài tập</SelectItem>
            {allExercises.map((exercise) => (
              <SelectItem key={exercise.exercise_id} value={exercise.exercise_id}>
                {exercise.exercise_title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết tiến độ học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-48">Học viên</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Vai trò</TableHead>
                  {(selectedExercise === "all" ? allExercises : allExercises.filter(ex => ex.exercise_id === selectedExercise))
                    .map((exercise) => (
                      <TableHead key={exercise.exercise_id} className="text-center min-w-32">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xs font-medium">{exercise.exercise_title}</span>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <span>{getExerciseStats(exercise, filteredUsers).completed}/{filteredUsers.length}</span>
                            <span>({getExerciseStats(exercise, filteredUsers).percentage}%)</span>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  <TableHead className="text-center">Tổng kết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const completedCount = user.exercises.filter(ex => ex.is_completed).length;
                  const totalExercises = user.exercises.length;
                  const overallPercentage = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
                  const totalTime = user.exercises.reduce((acc, ex) => acc + ex.time_spent_minutes, 0);

                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.user_name}</div>
                          <div className="text-sm text-muted-foreground">{user.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.team_name ? (
                          <Badge variant="outline">{user.team_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa có team</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.user_role)}>
                          {user.user_role}
                        </Badge>
                      </TableCell>
                      {(selectedExercise === "all" ? user.exercises : user.exercises.filter(ex => ex.exercise_id === selectedExercise))
                        .map((exercise) => (
                          <TableCell key={exercise.exercise_id} className="text-center">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="flex items-center space-x-1">
                                <div className="flex items-center space-x-1" title="Video">
                                  <PlayCircle className="w-3 h-3" />
                                  <ProgressIcon completed={exercise.video_completed} className="w-3 h-3" />
                                </div>
                                <div className="flex items-center space-x-1" title="Kiểm tra">
                                  <Brain className="w-3 h-3" />
                                  <ProgressIcon completed={exercise.quiz_passed} className="w-3 h-3" />
                                </div>
                                <div className="flex items-center space-x-1" title="Thực hành">
                                  <Video className="w-3 h-3" />
                                  <ProgressIcon completed={exercise.practice_completed} className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="text-xs">
                                <Badge 
                                  variant={exercise.is_completed ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {exercise.completion_percentage}%
                                </Badge>
                              </div>
                              {(() => {
                                const videoProgress = getVideoProgress(user.user_id, exercise.exercise_id);
                                const watchedMinutes = Math.floor(((videoProgress as any)?.total_watch_time || 0) / 60);
                                const requiredMinutes = Math.floor(((videoProgress as any)?.total_required_watch_time || 0) / 60);
                                
                                if (watchedMinutes > 0 || requiredMinutes > 0) {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {formatProgressTime(watchedMinutes, requiredMinutes)}
                                    </div>
                                  );
                                } else if (exercise.time_spent_minutes > 0) {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {formatTime(exercise.time_spent_minutes)}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </TableCell>
                        ))}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <Badge 
                            variant={overallPercentage === 100 ? "default" : "secondary"}
                            className="font-medium"
                          >
                            {completedCount}/{totalExercises}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {overallPercentage}% - {formatTime(totalTime)}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};