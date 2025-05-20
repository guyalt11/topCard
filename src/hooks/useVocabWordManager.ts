
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  VocabList, 
  VocabWord,
  DifficultyLevel,
  PracticeDirection,
  DIFFICULTY_TO_SM2_QUALITY,
  calculateSM2NextInterval
} from '@/types/vocabulary';

interface VocabWordManagerProps {
  lists: VocabList[];
  setLists: (lists: VocabList[]) => void;
  currentList: VocabList | null;
  setCurrentList: (list: VocabList | null) => void;
}

export function useVocabWordManager({ lists, setLists, currentList, setCurrentList }: VocabWordManagerProps) {
  // Update current list when it exists in the loaded lists
  useEffect(() => {
    if (currentList) {
      const updatedList = lists.find(l => l.id === currentList.id);
      if (updatedList) {
        setCurrentList(updatedList);
      } else {
        setCurrentList(null);
      }
    }
  }, [lists, currentList, setCurrentList]);

  // Add a word to a list
  const addWord = (listId: string, wordData: Omit<VocabWord, 'id'>) => {
    const word: VocabWord = {
      ...wordData,
      id: uuidv4(),
    };

    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          words: [...list.words, word],
          updatedAt: new Date(),
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // Update a word in any list
  const updateWord = (wordId: string, updates: Partial<VocabWord>) => {
    const updatedLists = lists.map(list => {
      const wordIndex = list.words.findIndex(w => w.id === wordId);
      if (wordIndex >= 0) {
        const updatedWords = [...list.words];
        updatedWords[wordIndex] = { ...updatedWords[wordIndex], ...updates };
        return { ...list, words: updatedWords };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // Delete a word from any list
  const deleteWord = (wordId: string) => {
    const updatedLists = lists.map(list => {
      const wordIndex = list.words.findIndex(w => w.id === wordId);
      if (wordIndex >= 0) {
        return {
          ...list,
          words: list.words.filter(w => w.id !== wordId),
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // Update a word's difficulty and next review time based on spaced repetition
  const updateWordDifficulty = (
    wordId: string, 
    difficulty: DifficultyLevel,
    direction: PracticeDirection
  ) => {
    const now = new Date();

    const updatedLists = lists.map(list => {
      const wordIndex = list.words.findIndex(w => w.id === wordId);
      if (wordIndex >= 0) {
        const word = list.words[wordIndex];
        
        // Get current SM2 parameters or initialize
        const currentSM2 = word.sm2?.[direction] || {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0
        };

        // Get SM2 quality rating from our difficulty level
        const quality = DIFFICULTY_TO_SM2_QUALITY[difficulty];
        
        // Calculate next interval using SM2 algorithm
        const { nextParams, intervalMs } = calculateSM2NextInterval(currentSM2, quality);

        // Calculate next review date
        const nextReviewDate = new Date(now.getTime() + intervalMs);

        // Update word with new SM2 parameters and next review date
        const updatedWords = [...list.words];
        updatedWords[wordIndex] = { 
          ...word, 
          sm2: {
            ...word.sm2 || {}, // Keep existing SM2 data for other direction if it exists
            [direction]: nextParams
          },
          nextReview: {
            ...word.nextReview || {}, // Keep existing review dates for other direction 
            [direction]: nextReviewDate
          }
        };

        return { 
          ...list,
          words: updatedWords,
          updatedAt: new Date(),
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  return {
    addWord,
    updateWord,
    deleteWord,
    updateWordDifficulty
  };
}
