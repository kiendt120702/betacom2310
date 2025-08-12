import React from "react";
import PersonalLearningStats from "@/components/learning/PersonalLearningStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Loader2 } from "lucide-react";

const Management = () => {
  const { data: userProfile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile?.role === "học việc/thử việc") {
    return (
      <div className="container mx-auto py-6">
        <PersonalLearningStats />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Tiến độ học tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Trang này chỉ hiển thị thống kê học tập cho vai trò "Học việc/Thử việc".
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Management;