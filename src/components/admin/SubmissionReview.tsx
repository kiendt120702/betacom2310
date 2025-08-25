import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, FileText, MessageSquare } from "lucide-react";
import { useAllQuizSubmissions } from "@/hooks/useQuizSubmissions";
import { useAllEssaySubmissions } from "@/hooks/useEssaySubmissions";
import { useEduExercises } from "@/hooks/useEduExercises";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SubmissionReview: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const { data: exercises = [] } = useEduExercises();
  const { data: quizSubmissions = [], isLoading: quizLoading } = useAllQuizSubmissions(selectedExercise);
  const { data: essaySubmissions = [], isLoading: essayLoading } = useAllEssaySubmissions(selectedExercise);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <Select onValueChange={(value) => setSelectedExercise(value === "all" ? null : value)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Lọc theo bài học..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bài học</SelectItem>
              {exercises.map(ex => (
                <SelectItem key={ex.id} value={ex.id}>{ex.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="mcq">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mcq"><FileText className="w-4 h-4 mr-2" />Trắc nghiệm</TabsTrigger>
            <TabsTrigger value="essay"><MessageSquare className="w-4 h-4 mr-2" />Tự luận</TabsTrigger>
          </TabsList>
          <TabsContent value="mcq">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizSubmissions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.profiles?.full_name || sub.profiles?.email}</TableCell>
                    <TableCell>{sub.edu_quizzes?.edu_knowledge_exercises?.title}</TableCell>
                    <TableCell>{sub.score}%</TableCell>
                    <TableCell>
                      {sub.passed ? <Badge className="bg-green-100 text-green-800">Đạt</Badge> : <Badge variant="destructive">Chưa đạt</Badge>}
                    </TableCell>
                    <TableCell>{format(new Date(sub.submitted_at!), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Xem chi tiết</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="essay">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {essaySubmissions.map(sub => {
                  const isLate = sub.submitted_at && sub.started_at && sub.time_limit_minutes &&
                    (new Date(sub.submitted_at).getTime() > new Date(sub.started_at).getTime() + sub.time_limit_minutes * 60000);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.profiles?.full_name || sub.profiles?.email}</TableCell>
                      <TableCell>{sub.edu_knowledge_exercises?.title}</TableCell>
                      <TableCell>
                        {sub.submitted_at ? (
                          isLate ? <Badge variant="destructive">Nộp trễ</Badge> : <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>
                        ) : (
                          <Badge variant="secondary">Chưa nộp</Badge>
                        )}
                      </TableCell>
                      <TableCell>{sub.submitted_at ? format(new Date(sub.submitted_at), "dd/MM/yyyy HH:mm", { locale: vi }) : 'N/A'}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Xem chi tiết</Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubmissionReview;