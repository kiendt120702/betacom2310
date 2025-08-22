import React, { useState } from "react";
import { useEduExercises } from "@/hooks/useEduExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, AlertCircle, FileText, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingExercise } from "@/types/training";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PracticeTest {
  id: string;
  exercise_id: string;
  title: string;
  description: string;
  content: string;
  max_score: number;
  passing_score: number;
  time_limit: number; // minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PracticeTestDialogProps {
  exercise: TrainingExercise;
  practiceTest: PracticeTest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PracticeTestDialog: React.FC<PracticeTestDialogProps> = ({ exercise, practiceTest, open, onOpenChange, onSuccess }) => {
  const [title, setTitle] = useState(practiceTest?.title || "");
  const [description, setDescription] = useState(practiceTest?.description || "");
  const [content, setContent] = useState(practiceTest?.content || "");
  const [maxScore, setMaxScore] = useState(practiceTest?.max_score || 100);
  const [passingScore, setPassingScore] = useState(practiceTest?.passing_score || 60);
  const [timeLimit, setTimeLimit] = useState(practiceTest?.time_limit || 30);
  const [isActive, setIsActive] = useState(practiceTest?.is_active ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!practiceTest;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const practiceTestData = {
        exercise_id: exercise.id,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        max_score: maxScore,
        passing_score: passingScore,
        time_limit: timeLimit,
        is_active: isActive,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('practice_tests')
          .update(practiceTestData)
          .eq('id', practiceTest!.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('practice_tests')
          .insert([practiceTestData]);
        
        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: `${isEditing ? 'Cập nhật' : 'Tạo'} bài tập thực hành thành công`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving practice test:", error);
      toast({
        title: "Lỗi",
        description: `Không thể ${isEditing ? 'cập nhật' : 'tạo'} bài tập thực hành`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isEditing ? 'Chỉnh sửa' : 'Tạo mới'} Bài tập Thực hành: {exercise.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Tiêu đề bài tập *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài tập thực hành..."
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="timeLimit">Thời gian làm bài (phút)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="5"
                max="180"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về bài tập này..."
              className="min-h-[80px] mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Nội dung bài tập *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết bài tập thực hành (hướng dẫn, yêu cầu, tiêu chí đánh giá...)..."
              className="min-h-[200px] mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxScore">Điểm tối đa</Label>
              <Input
                id="maxScore"
                type="number"
                min="50"
                max="500"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Điểm đạt</Label>
              <Input
                id="passingScore"
                type="number"
                min="30"
                max={maxScore}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isActive">Kích hoạt bài tập này</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Đang lưu..." : (isEditing ? "Cập nhật" : "Tạo mới")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PracticeManagement: React.FC = () => {
  const { data: exercises, isLoading: exercisesLoading, refetch } = useEduExercises();
  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>([]);
  const [practiceTestsLoading, setPracticeTestsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null);
  const [selectedPracticeTest, setSelectedPracticeTest] = useState<PracticeTest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load practice tests
  React.useEffect(() => {
    const loadPracticeTests = async () => {
      setPracticeTestsLoading(true);
      try {
        const { data, error } = await supabase
          .from('practice_tests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPracticeTests(data as PracticeTest[] || []);
      } catch (error) {
        console.error("Error loading practice tests:", error);
      } finally {
        setPracticeTestsLoading(false);
      }
    };

    loadPracticeTests();
  }, []);

  const handleCreatePracticeTest = (exercise: TrainingExercise) => {
    setSelectedExercise(exercise);
    setSelectedPracticeTest(null);
    setDialogOpen(true);
  };

  const handleEditPracticeTest = (exercise: TrainingExercise, practiceTest: PracticeTest) => {
    setSelectedExercise(exercise);
    setSelectedPracticeTest(practiceTest);
    setDialogOpen(true);
  };

  const handleDeletePracticeTest = async (practiceTestId: string) => {
    try {
      const { error } = await supabase
        .from('practice_tests')
        .delete()
        .eq('id', practiceTestId);
      
      if (error) throw error;
      
      setPracticeTests(prev => prev.filter(pt => pt.id !== practiceTestId));
      toast({
        title: "Thành công",
        description: "Đã xóa bài tập thực hành",
      });
    } catch (error) {
      console.error("Error deleting practice test:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài tập thực hành",
        variant: "destructive",
      });
    }
  };

  const { toast } = useToast();

  const handleSuccess = async () => {
    // Reload practice tests
    setPracticeTestsLoading(true);
    try {
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPracticeTests(data as PracticeTest[] || []);
    } catch (error) {
      console.error("Error reloading practice tests:", error);
    } finally {
      setPracticeTestsLoading(false);
    }
    
    refetch();
    setSelectedExercise(null);
    setSelectedPracticeTest(null);
  };

  const getPracticeTestsForExercise = (exerciseId: string) => {
    return practiceTests.filter(pt => pt.exercise_id === exerciseId);
  };

  if (exercisesLoading || practiceTestsLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  const sortedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Quản lý Bài tập Thực hành</h2>
        <p className="text-muted-foreground">
          Tạo và quản lý các bài tập thực hành cho từng bài học. Bài tập thực hành giúp học viên áp dụng kiến thức đã học.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="tests">Danh sách bài tập</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bài tập Thực hành theo bài học
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedExercises.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead>Tên bài học</TableHead>
                        <TableHead>Số bài tập thực hành</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="w-32 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedExercises.map((exercise, index) => {
                        const practiceTestsForExercise = getPracticeTestsForExercise(exercise.id);
                        const activePracticeTests = practiceTestsForExercise.filter(pt => pt.is_active);
                        
                        return (
                          <TableRow key={exercise.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{exercise.title}</div>
                              {exercise.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {exercise.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">{practiceTestsForExercise.length}</span> bài tập
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {activePracticeTests.length} đang hoạt động
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {activePracticeTests.length > 0 ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  Có bài tập
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                  Chưa có bài tập
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCreatePracticeTest(exercise)}
                                  className="h-8 w-8 p-0"
                                  title="Tạo bài tập thực hành"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có bài học nào để tạo bài tập thực hành</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tất cả bài tập thực hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              {practiceTests.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bài học</TableHead>
                        <TableHead>Tiêu đề bài tập</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Điểm số</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="w-32 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {practiceTests.map((practiceTest) => {
                        const exercise = sortedExercises.find(e => e.id === practiceTest.exercise_id);
                        
                        return (
                          <TableRow key={practiceTest.id}>
                            <TableCell>
                              <div className="font-medium">{exercise?.title || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{practiceTest.title}</div>
                              {practiceTest.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {practiceTest.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{practiceTest.time_limit} phút</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                Đạt: <span className="font-medium">{practiceTest.passing_score}</span>
                                /{practiceTest.max_score}
                              </div>
                            </TableCell>
                            <TableCell>
                              {practiceTest.is_active ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  Hoạt động
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Tạm dừng
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPracticeTest(exercise!, practiceTest)}
                                  className="h-8 w-8 p-0"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận xóa bài tập</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa bài tập thực hành "{practiceTest.title}"? 
                                        Hành động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeletePracticeTest(practiceTest.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có bài tập thực hành nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedExercise && (
        <PracticeTestDialog
          exercise={selectedExercise}
          practiceTest={selectedPracticeTest}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default PracticeManagement;