import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

interface TrainingLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

const TrainingLayout: React.FC<TrainingLayoutProps> = ({ 
  children, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <TrainingLayoutSkeleton />;
  }

  return (
    <div className="flex h-full" role="main">
      {children}
    </div>
  );
};

const TrainingLayoutSkeleton: React.FC = () => (
  <div className="flex h-full">
    {/* Sidebar Skeleton */}
    <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
    
    {/* Main Content Skeleton */}
    <div className="flex-1 p-6">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-muted-foreground">
      <BookOpen className="h-12 w-12 mx-auto mb-4" aria-hidden="true" />
      <p>Chọn một bài tập để bắt đầu học</p>
    </div>
  </div>
);

export default TrainingLayout;
export { EmptyState };