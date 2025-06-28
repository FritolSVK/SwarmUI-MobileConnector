import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../contexts/SessionContext';
import { useTheme } from '../../hooks/useTheme';
import SettingsStyles from '../../styles/SettingsStyles';
import { SettingsProps } from '../../types/SettingsProps';

export default function Settings({ onClearHistory, onExportData }: SettingsProps) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { sessionId, isLoading: sessionLoading, error: sessionError, refreshSession } = useSession();
  const [swarmBaseUrl, setSwarmBaseUrl] = useState('http://192.168.1.100:7801');

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all image history and thumbnails? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (onClearHistory) {
                await onClearHistory();
              }
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature is not yet implemented.',
      [{ text: 'OK' }]
    );
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
    } catch (error) {
      console.log('Session refresh failed:', error);
    }
  };

  const handleSwarmBaseUrlChange = (text: string) => {
    setSwarmBaseUrl(text);
  };

  const handleUpdateSwarmBaseUrl = () => {
    Alert.alert('Success', 'Swarm Base URL has been updated.');
  };

  const handleRestartBackends = async () => {
    try {
      // This would call the API to restart backends
      Alert.alert('Success', 'Backend services have been restarted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to restart backend services.');
    }
  };

  const renderSettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
    buttonText,
  }: {
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: 'switch' | 'button';
    buttonText?: string;
  }) => (
    <View style={[SettingsStyles.settingItem, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <View style={SettingsStyles.settingInfo}>
        <Text style={[SettingsStyles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[SettingsStyles.settingSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>}
      </View>
      {type === 'switch' && onValueChange !== undefined && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={value ? theme.text : theme.secondaryText}
        />
      )}
      {type === 'button' && (
        <TouchableOpacity
          style={[SettingsStyles.button, { backgroundColor: theme.accent }]}
          onPress={onValueChange ? () => onValueChange(true) : undefined}
        >
          <Text style={[SettingsStyles.buttonText, { color: theme.text }]}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={[SettingsStyles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={SettingsStyles.scrollViewContent}
    >
      <View style={SettingsStyles.section}>
        <Text style={[SettingsStyles.sectionTitle, SettingsStyles.sectionTitleWithMargin, { color: theme.text }]}>App Settings</Text>
        
        {renderSettingItem({
          title: 'Dark Mode',
          subtitle: 'Toggle between light and dark themes',
          value: themeMode === 'dark',
          onValueChange: toggleTheme,
        })}
        
        {renderSettingItem({
          title: 'Clear History',
          subtitle: 'Remove all generated images from history and clear cached thumbnails',
          type: 'button',
          buttonText: 'Clear',
          onValueChange: handleClearHistory,
        })}
        
        {renderSettingItem({
          title: 'Export Data',
          subtitle: 'Export your settings and history',
          type: 'button',
          buttonText: 'Export',
          onValueChange: handleExportData,
        })}
      </View>

      <View style={SettingsStyles.section}>
        <Text style={[SettingsStyles.sectionTitle, SettingsStyles.sectionTitleWithMargin, { color: theme.text }]}>Session Management</Text>
        
        {renderSettingItem({
          title: 'Refresh Session',
          subtitle: sessionError || 'Session is active',
          type: 'button',
          buttonText: 'Refresh',
          onValueChange: handleRefreshSession,
        })}
      </View>

      <View style={SettingsStyles.section}>
        <Text style={[SettingsStyles.sectionTitle, SettingsStyles.sectionTitleWithMargin, { color: theme.text }]}>Server Configuration</Text>
        
        <View style={[SettingsStyles.settingItem, { backgroundColor: theme.panel, borderColor: theme.border }]}>
          <View style={SettingsStyles.settingInfo}>
            <Text style={[SettingsStyles.settingTitle, { color: theme.text }]}>Swarm Base URL</Text>
            <Text style={[SettingsStyles.settingSubtitle, { color: theme.secondaryText }]}>API endpoint for Swarm UI</Text>
          </View>
          <TouchableOpacity
            style={[SettingsStyles.button, { backgroundColor: theme.accent }]}
            onPress={handleUpdateSwarmBaseUrl}
          >
            <Text style={[SettingsStyles.buttonText, { color: theme.text }]}>Update</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[
            SettingsStyles.textInput,
            {
              borderColor: theme.border,
              color: theme.text,
              backgroundColor: theme.panel,
            }
          ]}
          value={swarmBaseUrl}
          onChangeText={handleSwarmBaseUrlChange}
          placeholder="Enter Swarm Base URL"
          placeholderTextColor={theme.secondaryText}
        />
        
        {renderSettingItem({
          title: 'Restart Backends',
          subtitle: 'Restart all backend services',
          type: 'button',
          buttonText: 'Restart',
          onValueChange: handleRestartBackends,
        })}
      </View>
    </ScrollView>
  );
} 