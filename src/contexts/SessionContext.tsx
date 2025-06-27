import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { apiService } from '../services/api';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
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
      setError(errorMessage);
      Alert.alert('Session Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await createSession();
  };

  useEffect(() => {
    // Create session on app startup
    createSession();
  }, []);

  const value: SessionContextType = {
    sessionId,
    isLoading,
    error,
    refreshSession,
  };

  // Show loading screen while session is being created
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing session...</Text>
      </View>
    );
  }

  // Show error screen if session creation failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to initialize session</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  // Only render children when session is ready
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242428FF',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f4f4f5',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242428FF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
  },
}); 