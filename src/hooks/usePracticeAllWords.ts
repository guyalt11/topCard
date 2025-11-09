import { useState, useCallback, useEffect } from 'react';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection, VocabWord } from '@/types/vocabulary';

export interface WordWithListInfo extends VocabWord {
  listId: string;
  listName: string;
  listLanguage: string;
}

export function usePracticeAllWords(direction: PracticeDirection) {
  const { lists, isLoading } = useVocab();
  const [practiceWords, setPracticeWords] = useState<WordWithListInfo[]>([]);

  // Fetch due words from all lists
  const getDueWords = useCallback(() => {
    if (!lists || lists.length === 0) return [];
  
    const now = new Date();
    const allDueWords: WordWithListInfo[] = [];
    
    lists.forEach(list => {
      list.words.forEach(word => {
        const nextReview = word.nextReview?.[direction];
        const isDue = !nextReview || nextReview <= now;
        
        if (isDue) {
          allDueWords.push({
            ...word,
            listId: list.id,
            listName: list.name,
            listLanguage: list.language
          });
        }
      });
    });
    
    return allDueWords;
  }, [lists, direction]);
  
  // Reset and shuffle practice words
  const resetPracticeWords = useCallback(() => {
    const dueWords = getDueWords();
    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
    setPracticeWords(shuffled);
  }, [getDueWords, lists.length]);
  
  // Initialize practice words when lists are loaded or direction changes
  useEffect(() => {
    if (isLoading) return;
    
    if (!lists || lists.length === 0) {
      setPracticeWords([]);
      return;
    }
    
    resetPracticeWords();
  }, [lists, direction, isLoading, resetPracticeWords]);

  return { practiceWords, resetPracticeWords };
}