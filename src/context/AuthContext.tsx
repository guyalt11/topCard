
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type User = {
  id: string;
  username: string;
  isAdmin: boolean;
  password?: string; // Added for updating purposes but should not be exposed
};

type UserCredentials = {
  username: string;
  password: string;
};

type AuthContextType = {
  currentUser: User | null;
  login: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  register: (credentials: UserCredentials) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  createUser: (user: { username: string; password: string; isAdmin: boolean }) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
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

// In a real app, you would use a secure authentication service
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize the auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      // Load the users from localStorage
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Initialize with an admin user if no users exist
        const adminUser = {
          id: uuidv4(),
          username: 'admin',
          password: 'admin123', // In a real app, this should be hashed
          isAdmin: true
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
        setUsers([adminUser]);
      }

      // Check if user is logged in
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: UserCredentials): Promise<boolean> => {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) return false;

    const users = JSON.parse(storedUsers);
    const user = users.find(
      (u: any) => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      // Remove the password before storing in state or localStorage
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (credentials: UserCredentials): Promise<boolean> => {
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // Check if username already exists
    if (users.some((u: any) => u.username === credentials.username)) {
      return false;
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      username: credentials.username,
      password: credentials.password, // In a real app, this should be hashed
      isAdmin: false // New users are not admins by default
    };

    // Add to users array
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Login the user
    const { password, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return true;
  };

  // Admin functions
  const createUser = (userData: { username: string; password: string; isAdmin: boolean }) => {
    const newUser = {
      id: uuidv4(),
      username: userData.username,
      password: userData.password, // In a real app, this should be hashed
      isAdmin: userData.isAdmin
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, ...updates };
      }
      return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // If updating the current user, update that too
    if (currentUser && currentUser.id === id) {
      const { password, ...updatesWithoutPassword } = updates;
      const updatedCurrentUser = { ...currentUser, ...updatesWithoutPassword };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        register,
        isAuthenticated: !!currentUser,
        isLoading,
        users,
        createUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
