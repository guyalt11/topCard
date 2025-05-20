
import { v4 as uuidv4 } from 'uuid';
import { VocabList } from '@/types/vocabulary';

interface VocabListManagerProps {
  lists: VocabList[];
  setLists: (lists: VocabList[]) => void;
  setCurrentList: (list: VocabList | null) => void;
}

export function useVocabListManager({ lists, setLists, setCurrentList }: VocabListManagerProps) {
  // Add a new list
  const addList = (name: string) => {
    const newList: VocabList = {
      id: uuidv4(),
      name,
      words: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLists = [...lists, newList];
    setLists(updatedLists);
  };

  // Update an existing list
  const updateList = (id: string, updates: Partial<VocabList>) => {
    const updatedLists = lists.map(list => {
      if (list.id === id) {
        return { ...list, ...updates };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // Delete a list
  const deleteList = (id: string) => {
    const updatedLists = lists.filter(list => list.id !== id);
    setLists(updatedLists);

    // If the deleted list is the current list, clear it
    setCurrentList(null);
  };

  // Set the currently selected list
  const selectList = (id: string) => {
    const list = lists.find(list => list.id === id);
    setCurrentList(list || null);
  };

  return {
    addList,
    updateList,
    deleteList,
    selectList
  };
}
