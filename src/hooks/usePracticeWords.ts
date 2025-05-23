
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
    if (!isInitializedRef.current && directionRef.current === direction) return;
    isInitializedRef.current = true;
  
    const dueWords = getDueWords();
    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
    console.log(`Reset practice words: ${shuffled.length} words available`);
  }, [getDueWords, direction]);
  
  // Initialize practice words only on mount or when direction changes
  directionRef.current = direction;
  useEffect(() => {
    if (!isInitializedRef.current) {
      resetPracticeWords();
      isInitializedRef.current = true;
    }
  }, [resetPracticeWords]);

  return { practiceWords, resetPracticeWords };
}
