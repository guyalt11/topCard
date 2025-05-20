
import { VocabWord, DifficultyLevel, PracticeDirection, getNextReviewTime } from '@/types/vocabulary';

export function useReviewTime() {
  // Helper to format time in minutes/hours/days
  const formatTime = (ms: number): string => {
    if (ms < 60 * 1000) {
      return '1m';
    } else if (ms < 60 * 60 * 1000) {
      return `${Math.round(ms / (60 * 1000))}m`;
    } else if (ms < 24 * 60 * 60 * 1000) {
      return `${Math.round(ms / (60 * 60 * 1000))}h`;
    } else {
      return `${Math.round(ms / (24 * 60 * 60 * 1000))}d`;
    }
  };
  
  // Calculate next review time and format it
  const getReviewTimeEstimate = (
    word: VocabWord, 
    difficulty: DifficultyLevel, 
    direction: PracticeDirection
  ): string => {
    const timeMs = getNextReviewTime(word, difficulty, direction);
    return formatTime(timeMs);
  };
  
  return { getReviewTimeEstimate, formatTime };
}
