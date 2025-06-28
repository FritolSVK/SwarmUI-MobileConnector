import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../hooks/useTheme';
import ArrowButtonStyles from '../../styles/ArrowButtonStyles';
import { ArrowButtonProps } from '../../types/ArrowButtonProps';

export default function ArrowButton({ direction, onPress, side = 'right' }: ArrowButtonProps) {
  const { theme } = useTheme();
  
  const positionStyle =
    Platform.OS === 'web'
      ? [
          ArrowButtonStyles.arrowButton, 
          side === 'left' ? ArrowButtonStyles.leftWeb : 
          side === 'center' ? ArrowButtonStyles.centerWeb : 
          ArrowButtonStyles.rightWeb
        ]
      : [
          ArrowButtonStyles.arrowButton, 
          side === 'left' ? ArrowButtonStyles.left : 
          side === 'center' ? ArrowButtonStyles.center : 
          ArrowButtonStyles.right
        ];
  
  const getArrowIcon = () => {
    switch (direction) {
      case 'left': return 'chevron-left';
      case 'right': return 'chevron-right';
      case 'up': return 'chevron-up';
      case 'down': return 'chevron-down';
      default: return 'chevron-right';
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        positionStyle,
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
    >
      <FontAwesome 
        name={getArrowIcon()} 
        size={16} 
        color={theme.accent} 
      />
    </TouchableOpacity>
  );
} 