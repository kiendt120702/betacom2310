import React, { Suspense } from "react";
import ReportErrorBoundary from "@/components/common/ReportErrorBoundary";

// Lazy load the optimized page for code splitting
const ComprehensiveReportsPageOptimized = React.lazy(() => 
  import("./ComprehensiveReportsPageOptimized")
);

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Đang tải báo cáo tổng hợp...</p>
    </div>
  </div>
);

/**
 * Production-Ready ComprehensiveReportsPage với:
 * - Error Boundary: Graceful error handling
 * - Code Splitting: Lazy loading cho better performance
 * - Loading States: Better UX
 * - Type Safety: Full TypeScript coverage
 * 
 * Architecture Stack:
 * ┌─ Error Boundary (Catches all JS errors)
 * ├─ Suspense (Handles lazy loading)
 * ├─ Context Provider (Eliminates props drilling)
 * ├─ Memoized Components (Prevents re-renders)
 * └─ Pre-computed Data (Optimized calculations)
 */
const ComprehensiveReportsPageFinal: React.FC = () => {
  return (
    <ReportErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <ComprehensiveReportsPageOptimized />
      </Suspense>
    </ReportErrorBoundary>
  );
};

export default ComprehensiveReportsPageFinal;