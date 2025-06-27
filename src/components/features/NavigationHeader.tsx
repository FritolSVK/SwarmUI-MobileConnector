import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type NavigationTab = 'main' | 'history' | 'settings';

interface NavigationHeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  galleryCount?: number;
}

export default function NavigationHeader({ activeTab, onTabChange, galleryCount = 0 }: NavigationHeaderProps) {
  const { theme } = useTheme();

  const getIcon = (tab: NavigationTab) => {
    switch (tab) {
      case 'main':
        return '+';
      case 'history':
        return '≡';
      case 'settings':
        return '⚙';
      default:
        return '•';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.panel, borderColor: theme.border }, activeTab === 'main' && { backgroundColor: theme.accent, borderColor: theme.accent }]}
          onPress={() => onTabChange('main')}
        >
          <Text style={[styles.iconText, { color: theme.accent }, activeTab === 'main' && { color: theme.text }]}>
            {getIcon('main')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.panel, borderColor: theme.border }, activeTab === 'history' && { backgroundColor: theme.accent, borderColor: theme.accent }]}
          onPress={() => onTabChange('history')}
        >
          <Text style={[styles.iconText, { color: theme.accent }, activeTab === 'history' && { color: theme.text }]}>
            {getIcon('history')}
          </Text>
          {galleryCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.badgeText, { color: theme.text }]}>{galleryCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.panel, borderColor: theme.border }, activeTab === 'settings' && { backgroundColor: theme.accent, borderColor: theme.accent }]}
          onPress={() => onTabChange('settings')}
        >
          <Text style={[styles.iconText, { color: theme.accent }, activeTab === 'settings' && { color: theme.text }]}>
            {getIcon('settings')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    right: 16,
    zIndex: 1000,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 0,
    margin: 0,
    position: 'relative',
  },
  activeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  iconText: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  activeIconText: {
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 