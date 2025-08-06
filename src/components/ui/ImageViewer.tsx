import React from 'react';
import { ActivityIndicator, Animated, Image, View } from 'react-native';
import { getSwarmPassword } from '../../constants/config';
import { useImageZoom } from '../../hooks/useImageZoom';
import { useTheme } from '../../hooks/useTheme';
import ImageViewerStyles from '../../styles/ImageViewerStyles';
import { ImageViewerProps } from '../../types/ImageViewerProps';

export default function ImageViewer({ imageUrl, loading, imageWidth, imageHeight, onZoomStart }: ImageViewerProps) {
  const { scale, pan, panResponder } = useImageZoom(onZoomStart || (() => {}));
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[ImageViewerStyles.imageWrapper, { backgroundColor: theme.panel }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View style={[ImageViewerStyles.imageWrapper, { backgroundColor: theme.panel }]}>
        <View style={ImageViewerStyles.imageContainer}>
          {/* Placeholder content */}
        </View>
      </View>
    );
  }

  return (
    <View style={[ImageViewerStyles.imageWrapper, { backgroundColor: theme.panel }]}>
      <Animated.View
        style={[
          ImageViewerStyles.imageContainer,
          {
            transform: [{ scale }, { translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ 
            uri: imageUrl,
            headers: {
              'X-Password': getSwarmPassword()
            }
          }}
          style={[
            ImageViewerStyles.image,
            {
              width: imageWidth,
              height: imageHeight,
            },
          ]}
          resizeMode="contain"
          // Add fade-in effect for smoother transitions
          fadeDuration={200}
          // Show loading indicator while image is loading
          loadingIndicatorSource={require('../../../assets/images/icon.png')}
        />
      </Animated.View>
    </View>
  );
} 