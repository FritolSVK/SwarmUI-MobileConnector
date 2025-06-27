import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getSwarmBaseUrl, setSwarmBaseUrl } from '../../constants/config';
import { useSession } from '../../contexts';
import { useTheme } from '../../hooks/useTheme';
import { apiService } from '../../services/api';

interface SettingsProps {
  onClearHistory?: () => void;
  onExportData?: () => void;
}

export default function Settings({ onClearHistory, onExportData }: SettingsProps) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { sessionId, isLoading: sessionLoading, error: sessionError, refreshSession } = useSession();
  const [swarmBaseUrl, setSwarmBaseUrlState] = useState(getSwarmBaseUrl());

  const handleClearHistory = () => {
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      const confirmed = window.confirm('Are you sure you want to clear all generated images? This action cannot be undone.');
      if (confirmed) {
        onClearHistory?.();
      }
    } else {
      // Use React Native Alert for mobile platforms
      Alert.alert(
        'Clear History',
        'Are you sure you want to clear all generated images? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: () => {
              onClearHistory?.();
            }
          },
        ]
      );
    }
  };

  const handleExportData = () => {
    onExportData?.();
    if (Platform.OS === 'web') {
      alert('Data export feature coming soon!');
    } else {
      Alert.alert('Export', 'Data export feature coming soon!');
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      if (Platform.OS === 'web') {
        alert('Session refreshed successfully');
      } else {
        Alert.alert('Success', 'Session refreshed successfully');
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(`Failed to refresh session: ${error.message}`);
      } else {
        Alert.alert('Error', `Failed to refresh session: ${error.message}`);
      }
    }
  };

  const handleSwarmBaseUrlChange = (text: string) => {
    setSwarmBaseUrlState(text);
  };

  const handleSwarmBaseUrlSubmit = () => {
    setSwarmBaseUrl(swarmBaseUrl);
    if (Platform.OS === 'web') {
      alert('Swarm Base URL updated!');
    } else {
      Alert.alert('Success', 'Swarm Base URL updated!');
    }
  };

  const handleRestartBackends = async () => {
    try {
      await apiService.restartBackends();
      if (Platform.OS === 'web') {
        alert('Backends restarted successfully');
      } else {
        Alert.alert('Success', 'Backends restarted successfully');
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(`Failed to restart backends: ${error.message}`);
      } else {
        Alert.alert('Error', `Failed to restart backends: ${error.message}`);
      }
    }
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch',
    buttonText = 'Action'
  }: {
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
    buttonText?: string;
  }) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.disabled, true: theme.accent }}
          thumbColor={value ? theme.panel : theme.background}
        />
      )}
      {type === 'button' && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.accent }]} 
          onPress={() => {
            if (title === 'Clear history') {
              handleClearHistory();
            } else if (title === 'Export data') {
              handleExportData();
            } else if (title === 'Refresh session') {
              handleRefreshSession();
            }
          }}
          disabled={sessionLoading}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {sessionLoading && title === 'Refresh session' ? 'Refreshing...' : buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Session Management</Text>
        <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Session Status</Text>
            <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>
              {sessionLoading ? 'Initializing...' : 
               sessionError ? 'Error' : 
               sessionId ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <SettingItem
          title="Refresh session"
          subtitle="Create a new session if current one is having issues"
          type="button"
          buttonText="Refresh"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>App Settings</Text>
        <SettingItem
          title="Dark mode"
          subtitle="Use dark theme throughout the app"
          value={themeMode === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Data Management</Text>
        <SettingItem
          title="Clear history"
          subtitle="Delete all loaded images from cache"
          type="button"
          buttonText="Clear"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Network</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Swarm Base URL</Text>
            <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>Change the backend server address</Text>
          </View>
          <TextInput
            style={{
              minWidth: 180,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 6,
              paddingHorizontal: 8,
              color: theme.text,
              backgroundColor: theme.panel,
            }}
            value={swarmBaseUrl}
            onChangeText={handleSwarmBaseUrlChange}
            onBlur={handleSwarmBaseUrlSubmit}
            onSubmitEditing={handleSwarmBaseUrlSubmit}
            placeholder="http://10.0.2.2:7801"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text, borderBottomColor: theme.border }]}>Backend Management</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.accent, marginTop: 8 }]} 
          onPress={handleRestartBackends}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Restart All Backends</Text>
        </TouchableOpacity>
      </View>

        <View style={styles.aboutItem}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Version</Text>
          <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>Build</Text>
          <Text style={[styles.settingSubtitle, { color: theme.secondaryText }]}>2024.1.1</Text>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    marginRight: 56,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  themeButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 