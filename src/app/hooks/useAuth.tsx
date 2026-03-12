import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  // Mock properties to match existing components temporarily
  avatar?: string;
  department?: string;
  role?: string;
  points?: number;
  completedCourses?: number;
  totalHours?: number;
  rank?: number;
  streak?: number;
  avgScore?: number;
  badges?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const userData = await response.json();
        // Add default/mock values for missing fields to avoid breaking components
        const fullUser = {
          ...userData,
          avatar: "https://via.placeholder.com/150",
          department: "General",
          role: "Learner",
          points: 0,
          completedCourses: 0,
          totalHours: 0,
          rank: 0,
          streak: 0,
          avgScore: 0,
          badges: []
        };
        setUser(fullUser);
        return fullUser;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Wait for user data to be fetched before returning
        const user = await fetchUser();
        return user;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      // Optional: clear local state or redirect logic is handled by consumer
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
