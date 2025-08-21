import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PageLoader = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar Skeleton */}
      <div className="w-56 border-r p-3 space-y-2">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <div className="pt-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;