import React from "react";
import { ReportProvider } from "@/contexts/ReportContext";
import ReportStatistics from "@/components/reports/ReportStatistics";
import ReportLegend from "@/components/reports/ReportLegend";
import ReportUploadSection from "@/components/reports/ReportUploadSection";
import ReportDataSection from "@/components/reports/ReportDataSection";

const ComprehensiveReportsPage: React.FC = () => {
  return (
    <ReportProvider>
      <div className="space-y-6">
        <ReportStatistics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportUploadSection />
          <ReportLegend />
        </div>
        <ReportDataSection />
      </div>
    </ReportProvider>
  );
};

export default React.memo(ComprehensiveReportsPage);