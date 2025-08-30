import { TrainingExercise } from "@/types/training";

/**
 * Calculate the total required watch time for an exercise based on video duration and required viewing count
 * @param exercise The exercise with video requirements
 * @param videoDurationMinutes The video duration in minutes
 * @returns Total required watch time in minutes
 */
export function calculateRequiredWatchTime(
  exercise: TrainingExercise, 
  videoDurationMinutes: number = 0
): number {
  if (!exercise.exercise_video_url || videoDurationMinutes === 0) {
    return 0;
  }
  
  return videoDurationMinutes * (exercise.required_viewing_count || 1);
}

/**
 * Format time display for progress tables
 * @param watchedMinutes Time already watched
 * @param requiredMinutes Total required time
 * @returns Formatted string like "60p/90p" or "1h 30p/2h"
 */
export function formatProgressTime(watchedMinutes: number, requiredMinutes: number): string {
  const formatSingleTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}p`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}p` : ''}`;
  };

  const watchedStr = formatSingleTime(watchedMinutes);
  const requiredStr = formatSingleTime(requiredMinutes);
  
  return `${watchedStr} / ${requiredStr}`;
}

/**
 * Calculate the progress percentage for video learning requirements
 * @param watchedMinutes Time watched
 * @param requiredMinutes Total required time
 * @param watchPercentage Percentage of video watched (0-100)
 * @param requiredViewingCount Number of times video must be viewed
 * @param currentViewCount Current number of times watched
 * @returns Progress percentage (0-100)
 */
export function calculateVideoProgressPercentage(
  watchedMinutes: number,
  requiredMinutes: number,
  watchPercentage: number,
  requiredViewingCount: number,
  currentViewCount: number
): number {
  if (requiredMinutes === 0) return 0;
  
  // Video must be watched to 90% completion AND required number of times
  const completionMet = watchPercentage >= 90;
  const viewCountMet = currentViewCount >= requiredViewingCount;
  
  if (completionMet && viewCountMet) {
    return 100;
  }
  
  // Partial progress based on time watched vs required
  const timeProgress = Math.min(100, (watchedMinutes / requiredMinutes) * 100);
  
  // Also consider viewing count progress
  const viewCountProgress = (currentViewCount / requiredViewingCount) * 100;
  
  // Return the lower of the two (both requirements must be met)
  return Math.min(timeProgress, viewCountProgress);
}