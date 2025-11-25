import { useState, useEffect } from 'react';
import { VocabList } from '@/types/vocabulary';
import { useAuth } from '@/context/AuthContext';
import { SUPABASE_URL, getAuthHeaders } from '@/lib/supabase';

export const useSharedLists = () => {
    const [sharedLists, setSharedLists] = useState<VocabList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, token } = useAuth();

    const fetchSharedLists = async () => {
        if (!currentUser || !token) {
            setSharedLists([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch lists where share=true and user_id is not the current user
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/lists?share=eq.true&user_id=neq.${currentUser.id}&order=created_at.desc`,
                { headers: getAuthHeaders(token) }
            );

            if (!response.ok) throw new Error('Failed to fetch shared lists');

            const fetchedLists: any[] = await response.json();

            // For each list, fetch its words
            const listsWithWords = await Promise.all(
                fetchedLists.map(async (list) => {
                    const wordsResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/words?list_id=eq.${list.id}&order=id.asc`,
                        { headers: getAuthHeaders(token) }
                    );

                    if (!wordsResponse.ok) throw new Error(`Failed to fetch words for list ${list.id}`);

                    const words = await wordsResponse.json();

                    // Parse dates from strings
                    const createdAt = new Date(list.created_at);
                    const updatedAt = new Date(list.updated_at);

                    // Format the list to match our application's VocabList type
                    return {
                        id: list.id,
                        name: list.name,
                        description: list.description || undefined,
                        language: list.language || 'de',
                        share: list.share || false,
                        words: words.map((word: any) => ({
                            ...word,
                            nextReview: word.nextReview ? parseJsonDates(word.nextReview) : undefined,
                            sm2: word.sm2 || undefined
                        })),
                        createdAt,
                        updatedAt
                    } as VocabList;
                })
            );

            setSharedLists(listsWithWords);
        } catch (err) {
            console.error('Error fetching shared lists:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

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

    useEffect(() => {
        fetchSharedLists();
    }, [currentUser, token]);

    return {
        sharedLists,
        isLoading,
        error,
        refreshSharedLists: fetchSharedLists
    };
};
