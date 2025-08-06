import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { setSwarmPassword } from '../constants/config';
import { apiService } from '../services/api';
import { loadUserSettings } from '../utils/storage';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  markSessionAsInvalid: () => void;
  retryCount: number;
  maxRetries: number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  const createSession = async (isRetry: boolean = false) => {
    try {
      if (!isRetry) {
        setIsLoading(true);
        setError(null);
        retryCountRef.current = 0;
      }
      
      console.log(`Attempting to create session${isRetry ? ` (retry ${retryCountRef.current + 1}/${maxRetries})` : ''}...`);
      const newSessionId = await apiService.createSession();
      console.log('Session created successfully:', newSessionId);
      setSessionId(newSessionId);
      retryCountRef.current = 0; // Reset retry count on success
      setIsLoading(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create session';
      console.log('Session creation failed:', errorMessage);
      setSessionId(null);
      
      if (!isRetry) {
        retryCountRef.current = 0;
      }
      
      retryCountRef.current++;
      
      if (retryCountRef.current < maxRetries) {
        console.log(`Session creation failed, retrying in ${retryDelay/1000} seconds... (attempt ${retryCountRef.current}/${maxRetries})`);
        setError(`Connection failed, retrying... (${retryCountRef.current}/${maxRetries})`);
        
        // Clear any existing retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        // Wait for 5 seconds before retrying
        retryTimeoutRef.current = setTimeout(() => {
          createSession(true);
        }, retryDelay);
      } else {
        console.log('Session creation failed after maximum retries');
        setError('Connection failed after multiple attempts');
        setIsLoading(false);
      }
    }
  };

  const refreshSession = async () => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    retryCountRef.current = 0; // Reset retry count for manual refresh
    await createSession();
  };

  const markSessionAsInvalid = () => {
    console.log('Session marked as invalid, creating new session...');
    setSessionId(null);
    setError('Session expired or invalid');
    // Don't reset retry count here to prevent loops when session creation itself fails
    // Only create a new session if we haven't exceeded max retries
    if (retryCountRef.current < maxRetries) {
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Add delay before retrying to prevent immediate retry loops
      retryTimeoutRef.current = setTimeout(() => {
        createSession(true);
      }, retryDelay);
    }
  };

  useEffect(() => {
    // Load saved settings and initialize app
    const initializeApp = async () => {
      try {
        // Load saved password
        const settings = await loadUserSettings();
        if (settings.swarmPassword) {
          setSwarmPassword(settings.swarmPassword);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      
      // Set up session error callback after initial session creation
      apiService.setSessionErrorCallback(markSessionAsInvalid);
      
      // Create initial session
      createSession();
    };
    
    initializeApp();
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const value: SessionContextType = {
    sessionId,
    isLoading,
    error,
    refreshSession,
    markSessionAsInvalid,
    retryCount: retryCountRef.current,
    maxRetries,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
} 