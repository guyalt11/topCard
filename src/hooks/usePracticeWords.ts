import { useState, useCallback, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection, VocabWord } from '@/types/vocabulary';

export function usePracticeWords(direction: PracticeDirection) {
  const { currentList, isLoading } = useVocab();
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
    if (!currentList) return;
    
    const dueWords = getDueWords();
    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
    console.log(`Reset practice words: ${shuffled.length} words available`);
  }, [getDueWords, currentList]);
  
  // Initialize practice words when list is loaded or direction changes
  useEffect(() => {
    if (isLoading) return;
    
    if (!currentList) {
      setPracticeWords([]);
      return;
    }
    
    resetPracticeWords();
  }, [currentList, direction, isLoading, resetPracticeWords]);

  return { practiceWords, resetPracticeWords };
}
