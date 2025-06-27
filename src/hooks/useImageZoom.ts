import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { UI_CONFIG } from '../constants/config';

export const useImageZoom = (onZoomStart?: () => void) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isZoomed = useRef(false);
  const hasZoomed = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isZoomed.current = true;
        if (!hasZoomed.current && onZoomStart) {
          hasZoomed.current = true;
          onZoomStart();
        }
        Animated.spring(scale, {
          toValue: UI_CONFIG.ZOOM_SCALE,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isZoomed.current) {
          pan.setValue({ x: -gestureState.dx, y: -gestureState.dy });
        }
      },
      onPanResponderRelease: () => {
        isZoomed.current = false;
        hasZoomed.current = false;
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        isZoomed.current = false;
        hasZoomed.current = false;
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  return {
    scale,
    pan,
    panResponder,
  };
}; 