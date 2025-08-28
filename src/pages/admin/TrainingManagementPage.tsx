import React, { useState, useEffect, useMemo } from "react";
import { useEduExercises, useDeleteEduExercise } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Shield, FileText, Edit } from "lucide-react";
import CreateExerciseDialog from "@/components/admin/CreateExerciseDialog";
import EditExerciseDialog from "@/components/admin/EditExerciseDialog";
import ExercisePermissionsDialog from "@/components/admin/ExercisePermissionsDialog";
import ManageQuizDialog from "@/components/admin/ManageQuizDialog";
import { TrainingExercise } from "@/types/training";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoManagement from "@/components/admin/VideoManagement";
import TheoryTestManagement from "@/components/admin/TheoryTestManagement";
import PracticeManagement from "@/components/admin/PracticeManagement";
import TheoryManagement from "@/components/admin/TheoryManagement";
import TrainingOverview from "@/components/admin/TrainingOverview";
import EssayGradingManagement from "@/components/admin/EssayGradingManagement";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import PracticeTestGrading from "@/components/admin/PracticeTestGrading";

const TrainingManagementPage: React.FC = () => {
  const { data: exercises, isLoading: exercisesLoading, refetch } = useEduExercises();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedExerciseForPermissions, setSelectedExerciseForPermissions] = useState<TrainingExercise | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedExerciseForQuiz, setSelectedExerciseForQuiz] = useState<TrainingExercise | null>(null);
  const { data: userProfile } = useUserProfile();

  const canGrade = useMemo(() => {
    if (!userProfile) return false;
    const isAdmin = userProfile.role === 'admin';
    const isTrainingDeptHead = userProfile.role === 'trưởng phòng' && userProfile.teams?.name === 'Phòng Đào Tạo';
    return isAdmin || isTrainingDeptHead;
  }, [userProfile]);

  const handleEditExercise = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handlePermissions = (exercise: TrainingExercise) => {
    setSelectedExerciseForPermissions(exercise);
    setPermissionsDialogOpen(true);
  };

  const handleManageQuiz = (exercise: TrainingExercise) => {
    setSelectedExerciseForQuiz(exercise);
    setQuizDialogOpen(true);
  };

  if (exercisesLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Edu Shopee</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập Edu Shopee
        </Button>
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList className={cn("grid w-full", canGrade ? "grid-cols-7" : "grid-cols-5")}>
          <TabsTrigger value="process">Tổng quan</TabsTrigger>
          <TabsTrigger value="videos">Video học</TabsTrigger>
          <TabsTrigger value="theory-content">Lý thuyết</TabsTrigger>
          <TabsTrigger value="theory-test">Kiểm tra lý thuyết</TabsTrigger>
          <TabsTrigger value="practice-test">Bài tập thực hành</TabsTrigger>
          {canGrade && <TabsTrigger value="essay-grading">Chấm bài tự luận</TabsTrigger>}
          {canGrade && <TabsTrigger value="practice-grading">Chấm bài thực hành</TabsTrigger>}
        </TabsList>
        <TabsContent value="process">
          {sortedExercises && sortedExercises.length > 0 ? (
            <TrainingOverview
              exercises={sortedExercises}
              onEdit={handleEditExercise}
              onPermissions={handlePermissions}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Chưa có bài tập Edu Shopee nào</CardTitle>
                <CardDescription className="mb-4">Tạo bài tập Edu Shopee đầu tiên để bắt đầu xây dựng quy trình đào tạo</CardDescription>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Tạo bài tập Edu Shopee</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="videos"><VideoManagement /></TabsContent>
        <TabsContent value="theory-content"><TheoryManagement /></TabsContent>
        <TabsContent value="theory-test"><TheoryTestManagement /></TabsContent>
        <TabsContent value="practice-test"><PracticeManagement /></TabsContent>
        {canGrade && <TabsContent value="essay-grading"><EssayGradingManagement /></TabsContent>}
        {canGrade && <TabsContent value="practice-grading"><PracticeTestGrading /></TabsContent>}
      </Tabs>

      <CreateExerciseDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      {selectedExercise && <EditExerciseDialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setSelectedExercise(null); }} exercise={selectedExercise} />}
      <ExercisePermissionsDialog open={permissionsDialogOpen} onClose={() => { setPermissionsDialogOpen(false); setSelectedExerciseForPermissions(null); }} exercise={selectedExerciseForPermissions} />
      {selectedExerciseForQuiz && <ManageQuizDialog open={quizDialogOpen} onClose={() => { setQuizDialogOpen(false); setSelectedExerciseForQuiz(null); }} exercise={selectedExerciseForQuiz} />}
    </div>
  );
};

export default TrainingManagementPage;