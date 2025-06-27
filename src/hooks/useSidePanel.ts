import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { UI_CONFIG } from '../constants/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const PANEL_EXPANDED_HEIGHT = Math.round((2 / 3) * SCREEN_HEIGHT);
export const PANEL_COLLAPSED_HEIGHT = 0;

export const useSidePanel = () => {
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showCoreParams, setShowCoreParams] = useState(true);
  const [showSampling, setShowSampling] = useState(false);

  // Animation for bottom panel
  const slideYAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(PANEL_EXPANDED_HEIGHT)).current;

  // Animation for main content height
  const mainContentHeightAnim = useRef(
    new Animated.Value(showSidePanel ? SCREEN_HEIGHT - PANEL_EXPANDED_HEIGHT : SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    // Set initial values based on current state
    slideYAnim.setValue(0);
    heightAnim.setValue(PANEL_EXPANDED_HEIGHT);
  }, [slideYAnim, heightAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideYAnim, {
        toValue: 0,
        duration: UI_CONFIG.ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnim, {
        toValue: showSidePanel ? PANEL_EXPANDED_HEIGHT : PANEL_COLLAPSED_HEIGHT,
        duration: UI_CONFIG.ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [showSidePanel, slideYAnim, heightAnim]);

  useEffect(() => {
    Animated.timing(mainContentHeightAnim, {
      toValue: showSidePanel ? SCREEN_HEIGHT - PANEL_EXPANDED_HEIGHT : SCREEN_HEIGHT,
      duration: UI_CONFIG.ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [showSidePanel, mainContentHeightAnim]);

  return {
    // State
    showSidePanel,
    showCoreParams,
    showSampling,
    
    // Setters
    setShowSidePanel,
    setShowCoreParams,
    setShowSampling,
    
    // Animations
    slideYAnim,
    heightAnim,
    mainContentHeightAnim,
    PANEL_EXPANDED_HEIGHT,
    PANEL_COLLAPSED_HEIGHT,
  };
}; 