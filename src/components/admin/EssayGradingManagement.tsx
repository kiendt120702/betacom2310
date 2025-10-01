import React, { useState, useMemo } from "react";
import { useAllEssaySubmissions, EssaySubmissionWithDetails } from "@/hooks/useEssaySubmissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import GradeEssayDialog from "./GradeEssayDialog";

const EssayGradingManagement: React.FC = () => {
  const { data: submissions = [], isLoading } = useAllEssaySubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<EssaySubmissionWithDetails | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const pendingSubmissions = useMemo(() => {
    if (!Array.isArray(submissions)) return [];
    return submissions.filter(s => s.status === 'pending');
  }, [submissions]);

  const handleGrade = (submission: EssaySubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setIsGrading(true);
  };

  const handleCloseDialog = () => {
    setIsGrading(false);
    setSelectedSubmission(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Chấm bài tự luận</CardTitle>
          <CardDescription>
            Danh sách các bài làm của học viên cần được chấm điểm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Bài tập</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.length > 0 ? (
                  pendingSubmissions.map(submission => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.profiles?.full_name || submission.profiles?.email}</TableCell>
                      <TableCell>{submission.edu_knowledge_exercises?.title}</TableCell>
                      <TableCell>{format(new Date(submission.submitted_at!), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleGrade(submission)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Chấm bài
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Không có bài nào cần chấm.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedSubmission && (
        <GradeEssayDialog
          submission={selectedSubmission}
          open={isGrading}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default EssayGradingManagement;