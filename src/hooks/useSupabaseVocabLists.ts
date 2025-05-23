
import { useState, useEffect, useCallback } from 'react';
import { VocabList, VocabWord } from '@/types/vocabulary';
import { useAuth } from '@/context/AuthContext';
import { SUPABASE_URL, getAuthHeaders } from '@/lib/supabase';

export const useSupabaseVocabLists = () => {
  const [lists, setLists] = useState<VocabList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, token } = useAuth();

  // Load lists from Supabase based on current user
  const fetchLists = useCallback(async () => {
    if (!currentUser || !token) {
      setLists([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the user's lists
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/lists?user_id=eq.${currentUser.id}&order=created_at.desc`,
        { headers: getAuthHeaders(token) }
      );

      if (!response.ok) throw new Error('Failed to fetch lists');
      
      const fetchedLists: any[] = await response.json();
      
      // For each list, fetch its words
      const listsWithWords = await Promise.all(
        fetchedLists.map(async (list) => {
          const wordsResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/words?list_id=eq.${list.id}&order=id.asc`,
            { headers: getAuthHeaders(token) }
          );
          
          if (!wordsResponse.ok) throw new Error(`Failed to fetch words for list ${list.id}`);
          
          const words: VocabWord[] = await wordsResponse.json();
          
          // Parse dates from strings
          const createdAt = new Date(list.created_at);
          const updatedAt = new Date(list.updated_at);
          
          // Format the list to match our application's VocabList type
          return {
            id: list.id,
            name: list.name,
            description: list.description || undefined,
            words: words.map(word => ({
              ...word,
              // Parse JSON fields if they exist
              nextReview: word.nextReview ? parseJsonDates(word.nextReview) : undefined,
              sm2: word.sm2 || undefined
            })),
            createdAt,
            updatedAt
          } as VocabList;
        })
      );
      
      setLists(listsWithWords);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, token]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Helper to parse nested dates in JSON objects
  const parseJsonDates = (jsonObj: any) => {
    if (!jsonObj) return undefined;
    
    const result: any = {};
    Object.keys(jsonObj).forEach(key => {
      if (typeof jsonObj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(jsonObj[key])) {
        result[key] = new Date(jsonObj[key]);
      } else {
        result[key] = jsonObj[key];
      }
    });
    return result;
  };

  // Save a list to Supabase
  const saveList = async (list: VocabList): Promise<VocabList> => {
    if (!currentUser || !token) {
      throw new Error('User not authenticated');
    }
    
    const isNew = !lists.some(l => l.id === list.id);
    
    if (isNew) {
      // Create a new list
      const response = await fetch(`${SUPABASE_URL}/rest/v1/lists`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          id: list.id,
          name: list.name,
          description: list.description || null,
          user_id: currentUser.id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create list');
      }
    } else {
      // Update an existing list
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/lists?id=eq.${list.id}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            name: list.name,
            description: list.description || null,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update list');
      }
    }
    
    // After saving the list, refresh the lists from the server
    await fetchLists();
    
    // Return the updated list from our state
    const updatedList = lists.find(l => l.id === list.id) || list;
    return updatedList;
  };

  // Delete a list from Supabase
  const deleteList = async (id: string): Promise<void> => {
    if (!currentUser || !token) {
      throw new Error('User not authenticated');
    }
    
    // First delete all words in the list (foreign key constraint)
    const deleteWordsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/words?list_id=eq.${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }
    );
    
    if (!deleteWordsResponse.ok) {
      const error = await deleteWordsResponse.json();
      throw new Error(error.message || 'Failed to delete list words');
    }
    
    // Then delete the list itself
    const deleteListResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/lists?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }
    );
    
    if (!deleteListResponse.ok) {
      const error = await deleteListResponse.json();
      throw new Error(error.message || 'Failed to delete list');
    }
    
    // Refresh the lists after deletion
    await fetchLists();
  };

  // Save a word to Supabase
  const saveWord = async (listId: string, word: VocabWord): Promise<VocabWord> => {
    if (!currentUser || !token) {
      throw new Error('User not authenticated');
    }
    
    const isNew = !lists.some(l => l.words.some(w => w.id === word.id));
    
    // Prepare the word data for Supabase - excluding removed columns
    const wordData = {
      list_id: listId,
      german: word.german,
      english: word.english,
      gender: word.gender || null,
      notes: word.notes || null,
      nextReview: word.nextReview || null,
      sm2: word.sm2 || null
    };
    
    if (isNew) {
      // Create a new word
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          id: word.id,
          ...wordData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create word');
      }
    } else {
      // Update an existing word
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/words?id=eq.${word.id}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(token),
          body: JSON.stringify(wordData)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update word');
      }
    }
    
    // Update the list's updated_at timestamp
    await fetch(
      `${SUPABASE_URL}/rest/v1/lists?id=eq.${listId}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          updated_at: new Date().toISOString()
        })
      }
    );
    
    // Refresh the lists after saving the word
    await fetchLists();
    
    return word;
  };

  // Delete a word from Supabase
  const deleteWord = async (wordId: string): Promise<void> => {
    if (!currentUser || !token) {
      throw new Error('User not authenticated');
    }
    
    // Find which list contains this word
    let listId: string | undefined;
    for (const list of lists) {
      const wordInList = list.words.find(w => w.id === wordId);
      if (wordInList) {
        listId = list.id;
        break;
      }
    }
    
    if (!listId) {
      throw new Error('Word not found in any list');
    }
    
    // Delete the word
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/words?id=eq.${wordId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete word');
    }
    
    // Update the list's updated_at timestamp
    await fetch(
      `${SUPABASE_URL}/rest/v1/lists?id=eq.${listId}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          updated_at: new Date().toISOString()
        })
      }
    );
    
    // Refresh the lists after deletion
    await fetchLists();
  };

  return { 
    lists, 
    isLoading, 
    error, 
    refreshLists: fetchLists,
    saveList,
    deleteList,
    saveWord,
    deleteWord
  };
};
