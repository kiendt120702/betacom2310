import React, { useState, useEffect, useMemo } from "react";
import { useGeneralTraining, GeneralTrainingExercise } from "@/hooks/useGeneralTraining";
import GeneralTrainingContentPage from "./GeneralTrainingContentPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Menu, X, Clock, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile } from "@/hooks/useUserProfile";

const GeneralTrainingPage = () => {
  const { data: exercises, isLoading } = useGeneralTraining();
  const { data: userProfile } = useUserProfile();
  const [selectedExercise, setSelectedExercise] = useState<GeneralTrainingExercise | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const orderedExercises = exercises?.sort((a, b) => a.order_index - b.order_index) || [];
  
  // Extract unique tags from exercises
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    orderedExercises.forEach(exercise => {
      exercise.tags?.forEach(tag => tags.add(tag.name));
    });
    return Array.from(tags).sort();
  }, [orderedExercises]);
  
  // Filter exercises by selected tag
  const filteredExercises = useMemo(() => {
    if (selectedTag === "all") return orderedExercises;
    return orderedExercises.filter(exercise => 
      exercise.tags?.some(tag => tag.name === selectedTag)
    );
  }, [orderedExercises, selectedTag]);
  
  // Check if user has access to exercise based on target_roles
  const hasAccess = (exercise: GeneralTrainingExercise) => {
    if (!exercise.target_roles || exercise.target_roles.length === 0) return true;
    if (!userProfile?.role) return false;
    return exercise.target_roles.includes(userProfile.role);
  };


  const handleSelectExercise = (exercise: GeneralTrainingExercise) => {
    setSelectedExercise(exercise);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b bg-muted/10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Đào tạo Chung
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {orderedExercises.length} bài học
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          orderedExercises.map((ex, index) => (
            <Button
              key={ex.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-3 text-left transition-all duration-200 rounded-lg",
                selectedExercise?.id === ex.id 
                  ? "bg-primary/10 border-primary/50 border" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => handleSelectExercise(ex)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  selectedExercise?.id === ex.id 
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 text-left">
                  <p className={cn(
                    "font-medium text-sm leading-tight",
                    selectedExercise?.id === ex.id ? "text-primary" : "text-foreground"
                  )}>{ex.title}</p>
                </div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );

  if (selectedExercise) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center justify-between p-4 border-b bg-background flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedExercise(null)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Quay lại danh sách
          </Button>
          <h2 className="text-xl font-semibold text-center truncate px-4">{selectedExercise.title}</h2>
          <div className="w-32"></div> {/* Spacer to help with centering title */}
        </div>
        
        {/* Main content area with content and recap */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lesson content (70%) */}
          <div className="flex-1 w-[70%] overflow-y-auto">
            <GeneralTrainingContentPage 
              exercise={selectedExercise} 
              onBack={() => setSelectedExercise(null)} 
            />
          </div>
          
          {/* Right side - Recap/Notes area (30%) */}
          <div className="w-[30%] p-4 bg-muted/20 border-l">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ghi chú & Tóm tắt</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ghi chú cá nhân
                  </label>
                  <textarea 
                    className="w-full mt-1 p-3 border rounded-md resize-none"
                    rows={6}
                    placeholder="Viết ghi chú của bạn về bài học..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tóm tắt bài học
                  </label>
                  <textarea 
                    className="w-full mt-1 p-3 border rounded-md resize-none"
                    rows={8}
                    placeholder="Tóm tắt những điều quan trọng bạn đã học..."
                  />
                </div>
                <Button className="w-full">
                  Lưu ghi chú
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Tag Filter Bar */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag("all")}
            className="rounded-full"
          >
            Tất cả
          </Button>
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, index) => {
            const isAccessible = hasAccess(exercise);
            const duration = 5; // Default duration as min_completion_time is not available
            
            return (
              <Card
                key={exercise.id}
                className={cn(
                  "group cursor-pointer transition-all duration-200 hover:shadow-lg",
                  isAccessible 
                    ? "hover:border-primary/50" 
                    : "opacity-60 cursor-not-allowed bg-muted/50"
                )}
                onClick={() => isAccessible && setSelectedExercise(exercise)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {exercise.title}
                        {!isAccessible && <Lock className="inline-block w-4 h-4 ml-2 text-muted-foreground" />}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {exercise.tags?.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="w-4 h-4" />
                        <span>Thời lượng: {duration} phút</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exercise.video_url && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Play className="w-4 h-4" />
                        <span>Có video bài giảng</span>
                      </div>
                    )}
                    
                    {isAccessible ? (
                      <Button className="w-full mt-4" size="sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Bắt đầu học
                      </Button>
                    ) : (
                      <div className="w-full mt-4 p-2 bg-muted rounded-md text-center text-sm text-muted-foreground">
                        <Lock className="w-4 h-4 mx-auto mb-1" />
                        Không có quyền truy cập
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {!isLoading && filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {selectedTag === "all" 
              ? "Chưa có bài học nào." 
              : `Không tìm thấy bài học cho tag "${selectedTag}".`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default GeneralTrainingPage;