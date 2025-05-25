
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, updateUserPassword, AuthResponse } from '@/lib/supabase';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

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
  checkAndRefreshToken: () => void;
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

const TOKEN_EXPIRY_DAYS = 1; // 1 day expiry

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshTokenExpiry = (user: User, authToken: string) => {
    const expiryTime = new Date().getTime() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    Cookies.set('currentUser', JSON.stringify(user), { expires: TOKEN_EXPIRY_DAYS });
    Cookies.set('authToken', authToken, { expires: TOKEN_EXPIRY_DAYS });
    Cookies.set('tokenExpiry', expiryTime.toString(), { expires: TOKEN_EXPIRY_DAYS });
  };

  const checkAndRefreshToken = () => {
    const storedUser = Cookies.get('currentUser');
    const storedToken = Cookies.get('authToken');
    const tokenExpiry = Cookies.get('tokenExpiry');

    if (!storedUser || !storedToken || !tokenExpiry) {
      logout();
      navigate('/login');
      return;
    }

    const now = new Date().getTime();
    const expiryTime = parseInt(tokenExpiry);

    if (now >= expiryTime) {
      logout();
      navigate('/login');
      return;
    }

    // Refresh the expiry time
    const user = JSON.parse(storedUser);
    refreshTokenExpiry(user, storedToken);
  };

  // Initialize the auth state from localStorage (for persistence between page reloads)
  useEffect(() => {
    const initAuth = () => {
      const storedUser = Cookies.get('currentUser');
      const storedToken = Cookies.get('authToken');
      const tokenExpiry = Cookies.get('tokenExpiry');
      
      if (storedUser && storedToken && tokenExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(tokenExpiry);
        
        if (now < expiryTime) {
          setCurrentUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else {
          // Token has expired
          logout();
          navigate('/login');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Check token expiration every minute
    const expirationCheck = setInterval(() => {
      const tokenExpiry = Cookies.get('tokenExpiry');
      if (tokenExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(tokenExpiry);
        
        if (now >= expiryTime) {
          logout();
          navigate('/login');
        }
      }
    }, 60000);

    return () => clearInterval(expirationCheck);
  }, [navigate]);

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
      
      // Save to cookies with initial expiry
      refreshTokenExpiry(user, authData.access_token);

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
    Cookies.remove('currentUser');
    Cookies.remove('authToken');
    Cookies.remove('tokenExpiry');
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
      
      // Save to cookies with initial expiry
      refreshTokenExpiry(user, authData.access_token);
      
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
        updatePassword,
        checkAndRefreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
