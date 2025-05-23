
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, updateUserPassword, AuthResponse } from '@/lib/supabase';

export type User = {
  id: string;
  email: string;
};

type UserCredentials = {
  email: string;
  password: string;
};

type AuthContextType = {
  currentUser: User | null;
  token: string | null;
  login: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  register: (credentials: UserCredentials) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updatePassword: (newPassword: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the auth state from localStorage (for persistence between page reloads)
  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        setCurrentUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: UserCredentials): Promise<boolean> => {
    try {
      const { email, password } = credentials;
      const authData = await loginUser(email, password);
      
      // Store the user and token
      const user = {
        id: authData.user.id,
        email: authData.user.email
      };
      
      setCurrentUser(user);
      setToken(authData.access_token);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', authData.access_token);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear state and localStorage
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  const register = async (credentials: UserCredentials): Promise<boolean> => {
    try {
      const { email, password } = credentials;
      const authData = await registerUser(email, password);
      
      // Store the user and token
      const user = {
        id: authData.user.id,
        email: authData.user.email
      };
      
      setCurrentUser(user);
      setToken(authData.access_token);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', authData.access_token);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    if (!token || !currentUser) return false;
    
    try {
      await updateUserPassword(token, newPassword);
      return true;
    } catch (error) {
      console.error('Password update failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!currentUser,
        isLoading,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
