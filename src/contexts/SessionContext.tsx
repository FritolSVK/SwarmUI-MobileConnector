import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  markSessionAsInvalid: () => void;
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

  const createSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newSessionId = await apiService.createSession();
      setSessionId(newSessionId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create session';
      console.log('Session creation failed:', errorMessage);
      setSessionId(null);
      setError('No Session');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await createSession();
  };

  const markSessionAsInvalid = () => {
    console.log('Session marked as invalid, creating new session...');
    setSessionId(null);
    setError('Session expired or invalid');
    createSession();
  };

  useEffect(() => {
    // Set up session error callback
    apiService.setSessionErrorCallback(markSessionAsInvalid);
    createSession();
  }, []);

  const value: SessionContextType = {
    sessionId,
    isLoading,
    error,
    refreshSession,
    markSessionAsInvalid,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
} 