
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VocabList, VocabWord, DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { useUserVocabLists } from '@/hooks/useUserVocabLists';
import { useVocabWordManager } from '@/hooks/useVocabWordManager';
import { useVocabListManager } from '@/hooks/useVocabListManager';
import { useVocabImportExport } from '@/hooks/useVocabImportExport';

interface VocabContextType {
  lists: VocabList[];
  currentList: VocabList | null;
  addList: (name: string) => void;
  updateList: (id: string, updates: Partial<VocabList>) => void;
  deleteList: (id: string) => void;
  selectList: (id: string) => void;
  addWord: (listId: string, word: Omit<VocabWord, 'id'>) => void;
  updateWord: (wordId: string, updates: Partial<VocabWord>) => void;
  deleteWord: (wordId: string) => void;
  updateWordDifficulty: (wordId: string, difficulty: DifficultyLevel, direction: PracticeDirection) => void;
  exportList: (id: string, format: 'json' | 'yaml') => void;
  importList: (file: File, listName: string) => Promise<void>;
}

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};

export const VocabProvider = ({ children }: { children: ReactNode }) => {
  // Use the custom hook to manage user-specific lists
  const { lists, setLists } = useUserVocabLists();
  const [currentList, setCurrentList] = useState<VocabList | null>(null);
  
  // Import custom hooks for vocabulary management
  const { addWord, updateWord, deleteWord, updateWordDifficulty } = useVocabWordManager({ lists, setLists, currentList, setCurrentList });
  const { addList, updateList, deleteList, selectList } = useVocabListManager({ lists, setLists, setCurrentList });
  const { exportList, importList } = useVocabImportExport({ lists, setLists });

  const value = {
    lists,
    currentList,
    addList,
    updateList,
    deleteList,
    selectList,
    addWord,
    updateWord,
    deleteWord,
    updateWordDifficulty,
    exportList,
    importList,
  };

  return (
    <VocabContext.Provider value={value}>
      {children}
    </VocabContext.Provider>
  );
};
