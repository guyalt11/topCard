import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

type ColorScheme = 'dark' | 'light' | 'neubrutalism';

type UserPreferences = {
    colorScheme: ColorScheme;
    username: string;
    hideEmptyLists: boolean;
    defaultDirection: boolean;
};

type PreferencesContextType = {
    preferences: UserPreferences | null;
    colorScheme: ColorScheme;
    updateColorScheme: (scheme: ColorScheme) => Promise<boolean>;
    isLoading: boolean;
};

const defaultPreferences: UserPreferences = {
    colorScheme: 'dark',
    username: '',
    hideEmptyLists: false,
    defaultDirection: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
    return context;
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user preferences from database
    const fetchPreferences = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // If no preferences exist, create default ones
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('preferences')
                        .insert([{
                            user_id: userId,
                            color_scheme: defaultPreferences.colorScheme,
                            username: defaultPreferences.username,
                            hide_empty_lists: defaultPreferences.hideEmptyLists,
                            default_direction: defaultPreferences.defaultDirection
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating preferences:', insertError);
                        setPreferences(defaultPreferences);
                    } else {
                        // Map database snake_case to camelCase
                        const mappedData: UserPreferences = {
                            colorScheme: newData.color_scheme as ColorScheme,
                            username: newData.username || '',
                            hideEmptyLists: newData.hide_empty_lists || false,
                            defaultDirection: newData.default_direction || false,
                        };
                        setPreferences(mappedData);
                    }
                } else {
                    console.error('Error fetching preferences:', error);
                    setPreferences(defaultPreferences);
                }
            } else {
                // Map database snake_case to camelCase
                const mappedData: UserPreferences = {
                    colorScheme: data.color_scheme as ColorScheme,
                    username: data.username || '',
                    hideEmptyLists: data.hide_empty_lists || false,
                    defaultDirection: data.default_direction || false,
                };
                console.log('Loaded preferences:', mappedData);
                setPreferences(mappedData);
            }
        } catch (error) {
            console.error('Error in fetchPreferences:', error);
            setPreferences(defaultPreferences);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply theme to document root
    useEffect(() => {
        if (preferences) {
            document.documentElement.setAttribute('data-theme', preferences.colorScheme);
        }
    }, [preferences?.colorScheme]);

    // Fetch preferences when user authenticates
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            setIsLoading(true);
            fetchPreferences(currentUser.id);
        } else {
            setPreferences(null);
            setIsLoading(false);
            // Reset to default theme when logged out
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, [isAuthenticated, currentUser?.id]);

    // Update color scheme in database
    const updateColorScheme = async (scheme: ColorScheme): Promise<boolean> => {
        if (!currentUser) return false;

        try {
            const { error } = await supabase
                .from('preferences')
                .update({ color_scheme: scheme })
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error updating color scheme:', error);
                return false;
            }

            // Update local state
            setPreferences(prev => prev ? { ...prev, colorScheme: scheme } : null);
            return true;
        } catch (error) {
            console.error('Error in updateColorScheme:', error);
            return false;
        }
    };

    return (
        <PreferencesContext.Provider value={{
            preferences,
            colorScheme: preferences?.colorScheme || 'dark',
            updateColorScheme,
            isLoading,
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};
