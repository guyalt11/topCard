export type Gender = 'm' | 'f' | 'n';

export type DifficultyLevel = 'hard' | 'ok' | 'good' | 'perfect';

export type PracticeDirection = 'translateTo' | 'translateFrom';

// SM-2 Algorithm parameters
export interface SM2Params {
  easeFactor: number;  // E-Factor, starts at 2.5
  interval: number;    // Inter-repetition interval in days
  repetitions: number; // Number of successful repetitions in a row
}

export interface VocabWord {
  id: string;
  en: string;      // English (anchor language)
  lng: string;     // Target language word
  gender?: Gender;
  notes?: string;

  // Track practice separately for each direction
  lastPracticed?: {
    translateTo?: Date;
    translateFrom?: Date;
  };
  nextReview?: {
    translateTo?: Date;
    translateFrom?: Date;
  };
  difficulty?: {
    translateTo?: DifficultyLevel;
    translateFrom?: DifficultyLevel;
  };

  // SM-2 parameters for each direction
  sm2?: {
    translateTo?: SM2Params;
    translateFrom?: SM2Params;
  };
}

export interface VocabList {
  id: string;
  name: string;
  description?: string;
  language: string;  // The target language code (e.g., 'de', 'fr', etc.)
  share?: boolean;
  pinned?: boolean;
  words: VocabWord[];
  createdAt: Date;
  updatedAt: Date;
}

// Map difficulty levels to SM-2 quality ratings (0-5)
export const DIFFICULTY_TO_SM2_QUALITY: Record<DifficultyLevel, number> = {
  hard: 1,     // Difficult response, significant effort
  ok: 3,       // Correct response, moderate effort
  good: 4,     // Correct response with little effort
  perfect: 5,  // Perfect response
};

// Initial SM-2 parameters
export const INITIAL_SM2_PARAMS: SM2Params = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0
};

// Default review times for first practice (in milliseconds)
export const INITIAL_REVIEW_SCHEDULE: Record<DifficultyLevel, number> = {
  hard: 1 * 60 * 1000, // 1 minute
  ok: 30 * 60 * 1000, // 30 minutes
  good: 4 * 60 * 60 * 1000, // 4 hours
  perfect: 12 * 60 * 60 * 1000, // 12 hours
};

// Get next review time based on SM2 algorithm
export const getNextReviewTime = (word: VocabWord, selectedDifficulty: DifficultyLevel, direction: PracticeDirection): number => {
  // Hard difficulty - always return 1 minute (60,000 ms)
  if (selectedDifficulty === 'hard') {
    return 1 * 60 * 1000; // Always exactly 1 minute for Hard
  }

  // Get current SM2 params or initialize if not exist
  const sm2Params = word.sm2?.[direction] || {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0
  };

  // Map our difficulty to SM2 quality
  const quality = DIFFICULTY_TO_SM2_QUALITY[selectedDifficulty];

  // Calculate next interval using SM2 algorithm
  const { intervalMs } = calculateSM2NextInterval(sm2Params, quality);

  return intervalMs;
};

/**
 * SM-2 Spaced Repetition Algorithm implementation
 * Based on the algorithm by Piotr Wozniak: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * 
 * @param params Current SM2 parameters for the item
 * @param quality Quality of the response (0-5 scale, where 0-2 is failure, 3-5 is success)
 * @returns New SM2 parameters and next interval in milliseconds
 */
export function calculateSM2NextInterval(
  params: SM2Params,
  quality: number
): { nextParams: SM2Params; intervalMs: number } {
  // Make a copy to avoid mutating the original
  const nextParams: SM2Params = { ...params };

  // If response quality < 3, start repetitions from scratch
  if (quality < 3) {
    nextParams.repetitions = 0;
    nextParams.interval = 0;

    // Calculate next interval for poor quality
    let intervalMs = 1 * 60 * 1000; // 1 minute for hard

    return { nextParams, intervalMs };
  } else {
    // Update repetitions counter
    nextParams.repetitions += 1;

    // Calculate interval based on repetition number
    if (nextParams.repetitions === 1) {
      // First successful review
      nextParams.interval = quality === 3 ? 0.021 : // 30 minutes for quality 3
        quality === 4 ? 0.083 : // 2 hours for quality 4
          0.33; // 8 hours for quality 5 (perfect)
    } else if (nextParams.repetitions === 2) {
      // Second successful review
      nextParams.interval = quality === 3 ? 0.083 : // 2 hours for quality 3
        quality === 4 ? 0.33 : // 8 hours for quality 4
          1; // 1 day for quality 5
    } else {
      // For repetitions > 2, use the formula with quality adjustments
      const qualityFactor = quality === 3 ? 0.5 : // Reduce interval more for OK
        quality === 4 ? 1.0 : // Normal interval for Good
          1.5;  // Increase interval for Perfect

      nextParams.interval = nextParams.interval * nextParams.easeFactor * qualityFactor;
    }

    // Update ease factor (E-Factor) based on quality of response
    // E-Factor formula from SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEF =
      nextParams.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // EF must remain ≥ 1.3
    nextParams.easeFactor = Math.max(1.3, newEF);

    // Convert interval from days to milliseconds
    const intervalMs = nextParams.interval * 24 * 60 * 60 * 1000;

    return { nextParams, intervalMs };
  }
}
