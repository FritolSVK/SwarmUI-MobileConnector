export interface ArrowButtonProps {
  direction: 'left' | 'right' | 'up' | 'down';
  onPress: () => void;
  side?: 'left' | 'right' | 'center';
} 