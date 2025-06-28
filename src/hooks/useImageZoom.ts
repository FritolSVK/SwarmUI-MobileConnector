import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { UI_CONFIG } from '../constants/config';

export const useImageZoom = (onZoomStart: () => void) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isZoomed = useRef(false);
  const hasZoomed = useRef(false);

  const handlePinchGesture = (gestureState: any) => {
    if (gestureState.numberActiveTouches === 2) {
      isZoomed.current = true;
      if (!hasZoomed.current) {
        hasZoomed.current = true;
        onZoomStart();
      }
      Animated.timing(scale, {
        toValue: Math.max(1, Math.min(3, gestureState.scale)),
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePanGesture = (gestureState: any) => {
    if (isZoomed.current) {
      pan.setValue({ x: -gestureState.dx, y: -gestureState.dy });
    }
  };

  const resetZoom = () => {
    isZoomed.current = false;
    hasZoomed.current = false;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: UI_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: UI_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isZoomed.current = false;
      hasZoomed.current = false;
    },
    onPanResponderMove: (_, gestureState) => {
      handlePinchGesture(gestureState);
      handlePanGesture(gestureState);
    },
    onPanResponderRelease: () => {
      // Handle release if needed
    },
  });

  return {
    scale,
    pan,
    panResponder,
    resetZoom,
  };
}; 