import type { EduExercise } from "@/hooks/useEduExercises";

/**
 * Training utility functions
 * Pure functions for training-related calculations and validations
 */

/**
 * Sort exercises by order_index
 */
export const sortExercisesByOrder = (exercises: EduExercise[]): EduExercise[] => {
  return [...exercises].sort((a, b) => a.order_index - b.order_index);
};

/**
 * Find the first incomplete exercise that is unlocked
 */
export const findFirstIncompleteExercise = (
  exercises: EduExercise[],
  completedExerciseIds: string[]
): EduExercise | null => {
  const sortedExercises = sortExercisesByOrder(exercises);
  
  for (let i = 0; i < sortedExercises.length; i++) {
    const exercise = sortedExercises[i];
    const isCompleted = completedExerciseIds.includes(exercise.id);
    const isUnlocked = i === 0 || completedExerciseIds.includes(sortedExercises[i - 1].id);
    
    if (!isCompleted && isUnlocked) {
      return exercise;
    }
  }
  
  return null;
};

/**
 * Calculate completion percentage for all exercises
 */
export const calculateCompletionPercentage = (
  totalExercises: number,
  completedExercises: number
): number => {
  if (totalExercises === 0) return 0;
  return Math.round((completedExercises / totalExercises) * 100);
};

/**
 * Get exercise statistics
 */
export const getExerciseStats = (
  exercises: EduExercise[],
  completedExerciseIds: string[]
) => {
  const total = exercises.length;
  const completed = completedExerciseIds.length;
  const remaining = total - completed;
  const percentage = calculateCompletionPercentage(total, completed);
  
  const requiredExercises = exercises.filter(ex => ex.is_required);
  const completedRequired = requiredExercises.filter(ex => 
    completedExerciseIds.includes(ex.id)
  ).length;
  
  return {
    total,
    completed,
    remaining,
    percentage,
    required: {
      total: requiredExercises.length,
      completed: completedRequired,
      remaining: requiredExercises.length - completedRequired,
    }
  };
};

/**
 * Validate if an exercise can be accessed
 */
export const canAccessExercise = (
  exercise: EduExercise,
  exercises: EduExercise[],
  completedExerciseIds: string[]
): { canAccess: boolean; reason?: string } => {
  const sortedExercises = sortExercisesByOrder(exercises);
  const exerciseIndex = sortedExercises.findIndex(ex => ex.id === exercise.id);
  
  if (exerciseIndex === -1) {
    return { canAccess: false, reason: "Exercise not found" };
  }
  
  // First exercise is always accessible
  if (exerciseIndex === 0) {
    return { canAccess: true };
  }
  
  // Check if previous exercise is completed
  const previousExercise = sortedExercises[exerciseIndex - 1];
  const isPreviousCompleted = completedExerciseIds.includes(previousExercise.id);
  
  if (!isPreviousCompleted) {
    return { 
      canAccess: false, 
      reason: `Complete "${previousExercise.title}" first` 
    };
  }
  
  return { canAccess: true };
};

/**
 * Get next exercise to unlock
 */
export const getNextExercise = (
  currentExercise: EduExercise,
  exercises: EduExercise[]
): EduExercise | null => {
  const sortedExercises = sortExercisesByOrder(exercises);
  const currentIndex = sortedExercises.findIndex(ex => ex.id === currentExercise.id);
  
  if (currentIndex === -1 || currentIndex >= sortedExercises.length - 1) {
    return null;
  }
  
  return sortedExercises[currentIndex + 1];
};

/**
 * Format time spent in human readable format
 */
export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 1) return "< 1 phút";
  if (minutes < 60) return `${Math.round(minutes)} phút`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
};

/**
 * Generate exercise completion message
 */
export const getCompletionMessage = (
  exercise: EduExercise,
  nextExercise: EduExercise | null
): string => {
  const baseMessage = `Bạn đã hoàn thành "${exercise.title}"!`;
  
  if (!nextExercise) {
    return `${baseMessage} Chúc mừng bạn đã hoàn thành tất cả bài tập!`;
  }
  
  return `${baseMessage} Tiếp theo: "${nextExercise.title}"`;
};

/**
 * Exercise state types for better type safety
 */
export type ExerciseState = 'locked' | 'unlocked' | 'completed';

/**
 * Get exercise state
 */
export const getExerciseState = (
  exercise: EduExercise,
  exercises: EduExercise[],
  completedExerciseIds: string[]
): ExerciseState => {
  if (completedExerciseIds.includes(exercise.id)) {
    return 'completed';
  }
  
  const { canAccess } = canAccessExercise(exercise, exercises, completedExerciseIds);
  return canAccess ? 'unlocked' : 'locked';
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};