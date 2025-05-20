
import { useState, useCallback, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection, VocabWord } from '@/types/vocabulary';

export function usePracticeWords(direction: PracticeDirection) {
  const { currentList } = useVocab();
  const [practiceWords, setPracticeWords] = useState<VocabWord[]>([]);
  const isInitializedRef = useRef(false);
  const directionRef = useRef(direction);

  // Fetch due words for practice
  const getDueWords = useCallback(() => {
    if (!currentList) return [];
    
    const now = new Date();
    return currentList.words.filter(word => {
      const nextReview = word.nextReview?.[direction];
      return !nextReview || nextReview <= now;
    });
  }, [currentList, direction]);

  // Reset and shuffle practice words
  const resetPracticeWords = useCallback(() => {
    const dueWords = getDueWords();
    // Shuffle the array of due words
    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
    console.log(`Reset practice words: ${shuffled.length} words available`);
  }, [getDueWords]);

  // Initialize practice words only on mount or when direction changes
  useEffect(() => {
    // Only reset if first initialization or direction has changed
    if (!isInitializedRef.current || directionRef.current !== direction) {
      resetPracticeWords();
      isInitializedRef.current = true;
      directionRef.current = direction;
      console.log(`Initialized practice words for direction: ${direction}`);
    }
  }, [direction, resetPracticeWords]);

  return { practiceWords, resetPracticeWords };
}
