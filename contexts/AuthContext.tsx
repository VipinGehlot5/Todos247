'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, staySignedIn?: boolean) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  updateInactivityTimeout: (minutes: number) => void;
  getInactivityTimeout: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get inactivity timeout from localStorage or use default
  const getInactivityTimeout = useCallback(() => {
    const stored = localStorage.getItem('inactivityTimeout');
    return stored ? parseInt(stored) : parseInt(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT || '10');
  }, []);

  // Update inactivity timeout
  const updateInactivityTimeout = useCallback((minutes: number) => {
    localStorage.setItem('inactivityTimeout', minutes.toString());
    resetInactivityTimer();
  }, []);

  // Reset all timers
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Reset warning state
    setShowWarning(false);
    setCountdown(60);

    // Don't set timer if user is not authenticated or stay signed in is enabled
    if (!authService.isAuthenticated()) return;
    
    const staySignedIn = localStorage.getItem('staySignedIn') === 'true';
    if (staySignedIn) return;

    const timeoutMinutes = getInactivityTimeout();
    
    // Set new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning popup
      setShowWarning(true);
      setCountdown(60);
      
      // Start countdown
      let count = 60;
      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count <= 0) {
          // Auto logout
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          logout();
        }
      }, 1000);
    }, timeoutMinutes * 60 * 1000);
  }, [getInactivityTimeout]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    if (showWarning) {
      setShowWarning(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    resetInactivityTimer();
  }, [showWarning, resetInactivityTimer]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && authService.isAuthenticated()) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Try to get current user from API
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Initial timer setup
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [user, handleUserActivity, resetInactivityTimer]);

  const login = async (username: string, password: string, staySignedIn: boolean = false) => {
    try {
      const userData = await authService.login({ 
        username, 
        password,
        expiresInMins: staySignedIn ? 43200 : 60 // 30 days if stay signed in, else 60 mins
      });
      setUser(userData);
      
      if (staySignedIn) {
        localStorage.setItem('staySignedIn', 'true');
      } else {
        localStorage.removeItem('staySignedIn');
      }
      
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      await authService.signup(data);
      toast.success('Signup successful! Please login with your credentials.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setShowWarning(false);
    toast.info('You have been logged out');
  };

  const stayLoggedIn = () => {
    setShowWarning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    resetInactivityTimer();
    toast.success('Session extended');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout,
        updateInactivityTimeout,
        getInactivityTimeout
      }}
    >
      {children}
      
      {/* Inactivity Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Session Timeout Warning</h2>
            <p className="text-gray-600 mb-4">
              You will be logged out due to inactivity in <span className="font-bold text-red-500">{countdown}</span> seconds.
            </p>
            <div className="flex gap-3">
              <button
                onClick={stayLoggedIn}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
