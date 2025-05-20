
import { useState, useEffect } from 'react';
import { VocabList } from '@/types/vocabulary';
import { useAuth } from '@/context/AuthContext';

export const useUserVocabLists = () => {
  const [lists, setLists] = useState<VocabList[]>([]);
  const { currentUser } = useAuth();
  
  // Load lists from localStorage based on current user
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.id;
      const storedLists = localStorage.getItem(`vocabLists_${userId}`);
      
      if (storedLists) {
        try {
          // Parse dates back from ISO strings
          const parsedLists = JSON.parse(storedLists, (key, value) => {
            // Check if the property might be a date based on format
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
              return new Date(value);
            }
            return value;
          });
          
          setLists(parsedLists);
        } catch (error) {
          console.error('Error parsing vocab lists:', error);
          setLists([]);
        }
      } else {
        setLists([]);
      }
    } else {
      // No user logged in
      setLists([]);
    }
  }, [currentUser]);
  
  // Save lists to localStorage
  const saveLists = (updatedLists: VocabList[]) => {
    if (currentUser) {
      const userId = currentUser.id;
      localStorage.setItem(`vocabLists_${userId}`, JSON.stringify(updatedLists));
      setLists(updatedLists);
    }
  };
  
  return { lists, setLists: saveLists };
};
