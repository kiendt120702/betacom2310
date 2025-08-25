import React from "react";
import SubmissionReview from "@/components/admin/SubmissionReview";
import { FileText } from "lucide-react";

const SubmissionReviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Chấm bài và xem lại
        </h1>
        <p className="text-muted-foreground mt-2">
          Xem lại các bài kiểm tra đã nộp của học viên.
        </p>
      </div>
      <SubmissionReview />
    </div>
  );
};

export default SubmissionReviewPage;