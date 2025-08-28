import React, { useState, useMemo } from "react";
import { useAllPracticeTestSubmissions, PracticeTestSubmissionWithDetails } from "@/hooks/usePracticeTestSubmissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import GradePracticeTestDialog from "./GradePracticeTestDialog";

const PracticeTestGrading: React.FC = () => {
  const { data: submissions = [], isLoading } = useAllPracticeTestSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<PracticeTestSubmissionWithDetails | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const pendingSubmissions = useMemo(() => {
    if (!Array.isArray(submissions)) return [];
    return submissions.filter(s => s.status === 'pending');
  }, [submissions]);

  const handleGrade = (submission: PracticeTestSubmissionWithDetails) => {
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
          <CardTitle>Chấm bài thực hành</CardTitle>
          <CardDescription>
            Danh sách các bài làm thực hành của học viên cần được chấm điểm.
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
                      <TableCell>{submission.practice_tests?.edu_knowledge_exercises?.title}</TableCell>
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
        <GradePracticeTestDialog
          submission={selectedSubmission}
          open={isGrading}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default PracticeTestGrading;