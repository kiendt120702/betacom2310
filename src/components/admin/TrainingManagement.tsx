import React, { useState, useEffect } from "react";
import { useEduExercises, useDeleteEduExercise, useUpdateExerciseOrder } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, Users, Video, Upload, CheckCircle, Play, Shield, FileText, AlertCircle, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CreateExerciseDialog from "./CreateExerciseDialog";
import EditExerciseDialog from "./EditExerciseDialog";
import ExercisePermissionsDialog from "./ExercisePermissionsDialog";
import ManageQuizDialog from "./ManageQuizDialog";
import { TrainingExercise } from "@/types/training";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoManagement from "./VideoManagement";
import TheoryTestManagement from "./TheoryTestManagement";
import PracticeTestManagement from "./PracticeTestManagement";
import TheoryManagement from "./TheoryManagement";
import PracticeManagement from "./PracticeManagement";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTableRowProps {
  exercise: TrainingExercise;
  children: React.ReactNode;
}

const SortableTableRow: React.FC<SortableTableRowProps> = ({ exercise, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-12">
        <Button variant="ghost" {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      {children}
    </TableRow>
  );
};

const TrainingManagement: React.FC = () => {
  const { data: exercises, isLoading } = useEduExercises();
  const { toast } = useToast();
  const deleteExerciseMutation = useDeleteEduExercise();
  const updateOrderMutation = useUpdateExerciseOrder();
  const [localExercises, setLocalExercises] = useState<TrainingExercise[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedExerciseForPermissions, setSelectedExerciseForPermissions] = useState<TrainingExercise | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedExerciseForQuiz, setSelectedExerciseForQuiz] = useState<TrainingExercise | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [practiceTests, setPracticeTests] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (exercises) {
      setLocalExercises(exercises.sort((a, b) => a.order_index - b.order_index));
    }
  }, [exercises]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        const updatePayload = newOrder.map((item, index) => ({
          id: item.id,
          order_index: index,
        }));

        updateOrderMutation.mutate(updatePayload);

        return newOrder;
      });
    }
  };

  const handleEditExercise = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setEditDialogOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePermissions = (exercise: TrainingExercise) => {
    setSelectedExerciseForPermissions(exercise);
    setPermissionsDialogOpen(true);
  };

  const handleManageQuiz = (exercise: TrainingExercise) => {
    setSelectedExerciseForQuiz(exercise);
    setQuizDialogOpen(true);
  };

  React.useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const { data: quizzesData, error: quizzesError } = await supabase.from('edu_quizzes').select('*');
        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);

        const { data: practiceTestsData, error: practiceTestsError } = await supabase.from('practice_tests').select('*').eq('is_active', true);
        if (practiceTestsError) throw practiceTestsError;
        setPracticeTests(practiceTestsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const hasQuiz = (exerciseId: string) => quizzes.some(quiz => quiz.exercise_id === exerciseId);
  const hasPracticeTest = (exerciseId: string) => practiceTests.some(test => test.exercise_id === exerciseId);

  if (isLoading || dataLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đào tạo</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập mới
        </Button>
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="process">Tổng quan</TabsTrigger>
          <TabsTrigger value="videos">Video học</TabsTrigger>
          <TabsTrigger value="theory-content">Lý thuyết</TabsTrigger>
          <TabsTrigger value="theory-test">Quiz lý thuyết</TabsTrigger>
          <TabsTrigger value="practice-test">Bài tập thực hành</TabsTrigger>
        </TabsList>
        <TabsContent value="process">
          {localExercises && localExercises.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quy trình đào tạo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead className="w-16">STT</TableHead>
                          <TableHead>Tên bài tập</TableHead>
                          <TableHead className="text-center">Video</TableHead>
                          <TableHead className="text-center">Lý thuyết</TableHead>
                          <TableHead className="text-center">Quiz</TableHead>
                          <TableHead className="text-center">Thực hành</TableHead>
                          <TableHead className="text-center">Video ôn tập</TableHead>
                          <TableHead className="w-40 text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext items={localExercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <TableBody>
                          {localExercises.map((exercise, index) => (
                            <SortableTableRow key={exercise.id} exercise={exercise}>
                              <TableCell className="font-medium">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                  {index + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{exercise.title}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                {exercise.exercise_video_url ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {exercise.content && exercise.content.trim() ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {hasQuiz(exercise.id) ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {hasPracticeTest(exercise.id) ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> : <AlertCircle className="w-5 h-5 text-orange-500 mx-auto" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {exercise.min_review_videos > 0 ? `${exercise.min_review_videos} video` : 'Không'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 justify-end">
                                  <Button variant="ghost" size="sm" onClick={() => handlePermissions(exercise)} className="h-8 w-8 p-0" title="Phân quyền"><Shield className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditExercise(exercise)} className="h-8 w-8 p-0" title="Chỉnh sửa"><Edit className="w-4 h-4" /></Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Xóa" disabled={deleteExerciseMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
                                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa bài tập "{exercise.title}"?</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteExerciseMutation.isPending}>
                                          {deleteExerciseMutation.isPending ? "Đang xóa..." : "Xóa"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </SortableTableRow>
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </div>
                </DndContext>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Chưa có bài tập nào</CardTitle>
                <CardDescription className="mb-4">Tạo bài tập kiến thức đầu tiên để bắt đầu xây dựng quy trình đào tạo</CardDescription>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Tạo bài tập mới</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="videos"><VideoManagement /></TabsContent>
        <TabsContent value="theory-content"><TheoryManagement /></TabsContent>
        <TabsContent value="theory-test"><TheoryTestManagement /></TabsContent>
        <TabsContent value="practice-test"><PracticeManagement /></TabsContent>
      </Tabs>

      <CreateExerciseDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      {selectedExercise && <EditExerciseDialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); setSelectedExercise(null); }} exercise={selectedExercise} />}
      <ExercisePermissionsDialog open={permissionsDialogOpen} onClose={() => { setPermissionsDialogOpen(false); setSelectedExerciseForPermissions(null); }} exercise={selectedExerciseForPermissions} />
      {selectedExerciseForQuiz && <ManageQuizDialog open={quizDialogOpen} onClose={() => { setQuizDialogOpen(false); setSelectedExerciseForQuiz(null); }} exercise={selectedExerciseForQuiz} />}
    </div>
  );
};

export default TrainingManagement;