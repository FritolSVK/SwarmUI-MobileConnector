import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../../hooks/useTheme';
import NavigationHeaderStyles from '../../styles/NavigationHeaderStyles';

export type NavigationTab = 'main' | 'history' | 'settings';

interface NavigationHeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  galleryCount?: number;
}

export default function NavigationHeader({ activeTab, onTabChange, galleryCount = 0 }: NavigationHeaderProps) {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getIcon = (tab: NavigationTab, isActive: boolean = false) => {
    const iconColor = isActive ? theme.text : theme.accent;
    
    switch (tab) {
      case 'main':
        return <FontAwesome5 name="plus" size={18} color={iconColor} />;
      case 'history':
        return <FontAwesome5 name="images" size={18} color={iconColor} />;
      case 'settings':
        return <FontAwesome5 name="sliders-h" size={18} color={iconColor} />;
      default:
        return <FontAwesome5 name="circle" size={18} color={iconColor} />;
    }
  };

  const openMenu = () => {
    if (isMenuOpen) {
      closeMenu();
      return;
    }
    
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-collapse after 2 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      closeMenu();
    }, 2000);
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleTabPress = (tab: NavigationTab) => {
    onTabChange(tab);
    closeMenu();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={NavigationHeaderStyles.container}>
      {/* Three dots button */}
      <TouchableOpacity
        style={[
          NavigationHeaderStyles.threeDotsButton, 
          { 
            backgroundColor: theme.buttonBackground, 
            borderColor: theme.border,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 3,
          }
        ]}
        onPress={openMenu}
        activeOpacity={0.7}
      >
        <FontAwesome5 
          name={isMenuOpen ? "ellipsis-v" : "ellipsis-h"} 
          size={18} 
          color={theme.accent} 
        />
      </TouchableOpacity>

      {/* Animated menu */}
      {isMenuOpen && (
        <Animated.View
          style={[
            NavigationHeaderStyles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={NavigationHeaderStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                NavigationHeaderStyles.button,
                { 
                  backgroundColor: theme.buttonBackground, 
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                },
                activeTab === 'main' && { backgroundColor: theme.buttonBackground, borderColor: theme.accent }
              ]}
              onPress={() => handleTabPress('main')}
              activeOpacity={0.7}
            >
              <Text style={[
                NavigationHeaderStyles.iconText,
                { color: theme.accent },
                activeTab === 'main' && { color: theme.text }
              ]}>
                {getIcon('main', activeTab === 'main')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                NavigationHeaderStyles.button,
                { 
                  backgroundColor: theme.buttonBackground, 
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                },
                activeTab === 'history' && { backgroundColor: theme.buttonBackground, borderColor: theme.accent }
              ]}
              onPress={() => handleTabPress('history')}
              activeOpacity={0.7}
            >
              <Text style={[
                NavigationHeaderStyles.iconText,
                { color: theme.accent },
                activeTab === 'history' && { color: theme.text }
              ]}>
                {getIcon('history', activeTab === 'history')}
              </Text>
              {galleryCount > 0 && (
                <View style={[NavigationHeaderStyles.badge, { backgroundColor: theme.accent }]}>
                  <Text style={[NavigationHeaderStyles.badgeText, { color: theme.text }]}>{galleryCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                NavigationHeaderStyles.button,
                { 
                  backgroundColor: theme.buttonBackground, 
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                },
                activeTab === 'settings' && { backgroundColor: theme.buttonBackground, borderColor: theme.accent }
              ]}
              onPress={() => handleTabPress('settings')}
              activeOpacity={0.7}
            >
              <Text style={[
                NavigationHeaderStyles.iconText,
                { color: theme.accent },
                activeTab === 'settings' && { color: theme.text }
              ]}>
                {getIcon('settings', activeTab === 'settings')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
} 