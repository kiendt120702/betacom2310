/**
 * Example calculations for video learning requirements
 * This file demonstrates how the new video learning requirements work
 */

import { formatProgressTime } from './videoTimeUtils';

export interface VideoLearningExample {
  videoTitle: string;
  videoDurationMinutes: number;
  requiredViewingCount: number;
  totalRequiredMinutes: number;
  userWatchedMinutes: number;
  displayFormat: string;
  isComplete: boolean;
}

/**
 * Generate examples of how the new video learning requirements display
 */
export function generateVideoLearningExamples(): VideoLearningExample[] {
  return [
    {
      videoTitle: "Hướng dẫn Shopee Basics",
      videoDurationMinutes: 30,
      requiredViewingCount: 3,
      totalRequiredMinutes: 30 * 3, // 90 minutes
      userWatchedMinutes: 75,
      displayFormat: formatProgressTime(75, 90), // "75p / 90p"
      isComplete: false // User needs 15 more minutes
    },
    {
      videoTitle: "Chiến lược bán hàng",
      videoDurationMinutes: 45,
      requiredViewingCount: 2,
      totalRequiredMinutes: 45 * 2, // 90 minutes
      userWatchedMinutes: 90,
      displayFormat: formatProgressTime(90, 90), // "90p / 90p"
      isComplete: true // User has completed the requirement
    },
    {
      videoTitle: "Tối ưu listing sản phẩm",
      videoDurationMinutes: 75, // 1h 15p
      requiredViewingCount: 2,
      totalRequiredMinutes: 75 * 2, // 150 minutes (2h 30p)
      userWatchedMinutes: 120, // 2h
      displayFormat: formatProgressTime(120, 150), // "2h / 2h 30p"
      isComplete: false // User needs 30 more minutes
    },
    {
      videoTitle: "Phân tích đối thủ",
      videoDurationMinutes: 25,
      requiredViewingCount: 1,
      totalRequiredMinutes: 25 * 1, // 25 minutes
      userWatchedMinutes: 25,
      displayFormat: formatProgressTime(25, 25), // "25p / 25p"
      isComplete: true // User has completed the requirement
    }
  ];
}

/**
 * Calculate total required watching time for a video
 */
export function calculateRequiredTime(videoDurationMinutes: number, requiredViewingCount: number): number {
  return videoDurationMinutes * requiredViewingCount;
}

/**
 * Check if user has met the viewing requirement
 * User must watch at least the total required time AND reach 90% completion in at least one session
 */
export function hasMetViewingRequirement(
  watchedMinutes: number, 
  requiredMinutes: number, 
  completionPercentage: number,
  viewingCount: number,
  requiredViewingCount: number
): boolean {
  return watchedMinutes >= requiredMinutes && 
         completionPercentage >= 90 && 
         viewingCount >= requiredViewingCount;
}