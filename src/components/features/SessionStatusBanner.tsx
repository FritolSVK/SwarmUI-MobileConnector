import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { lightTheme } from '../../constants/colors';
import { useSession } from '../../contexts/SessionContext';
import { useTheme } from '../../hooks/useTheme';
import SessionStatusBannerStyles from '../../styles/SessionStatusBannerStyles';

const BANNER_HEIGHT = 36;

export default function SessionStatusBanner() {
  const { sessionId, isLoading, error } = useSession();
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'failed' | 'connected' | null>(null);
  const slideAnim = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const hideTimeout = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      setStatus('connecting');
      setShow(true);
    } else if (error) {
      setStatus('failed');
      setShow(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      return;
    } else if (sessionId) {
      setStatus('connected');
      setShow(true);
    }

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (status !== 'failed') {
      hideTimeout.current = setTimeout(() => setShow(false), 2000);
    }
  }, [isLoading, sessionId, error, status]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: show ? 0 : -BANNER_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [show, slideAnim]);

  let bgColor = lightTheme.error;
  let text = '';

  if (status === 'connecting') {
    bgColor = lightTheme.warning;
    text = 'No Session. Connecting...';
  } else if (status === 'failed') {
    bgColor = lightTheme.error;
    text = 'No Session';
  } else if (status === 'connected') {
    bgColor = lightTheme.success;
    text = 'Session Connected';
  } else {
    return null;
  }

  return (
    <Animated.View
      style={[
        SessionStatusBannerStyles.banner,
        {
          backgroundColor: bgColor,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Text style={SessionStatusBannerStyles.bannerText}>{text}</Text>
    </Animated.View>
  );
} 