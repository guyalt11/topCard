import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

type UserCredentials = { email: string; password: string; };

type AuthContextType = {
  currentUser: User | null;
  token: string | null;
  login: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  register: (credentials: UserCredentials) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updatePassword: (newPassword: string) => Promise<boolean>;
  checkAndRefreshToken: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setToken(session.access_token);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(prev => prev?.id !== session.user.id ? session.user : prev);
        setToken(prev => prev !== session.access_token ? session.access_token : prev);
      } else {
        setCurrentUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: UserCredentials): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (credentials: UserCredentials): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp(credentials);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password update failed:', error);
      return false;
    }
  };

  const checkAndRefreshToken = () => {}; // Optional if Supabase handles it

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      login,
      logout,
      register,
      isAuthenticated: !!currentUser,
      isLoading,
      updatePassword,
      checkAndRefreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
