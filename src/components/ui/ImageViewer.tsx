import React from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native';
import { useImageZoom } from '../../hooks/useImageZoom';
import { useTheme } from '../../hooks/useTheme';
import { ImageViewerProps } from '../../types/ImageViewerProps';

export default function ImageViewer({ imageUrl, loading, imageWidth, imageHeight, onZoomStart }: ImageViewerProps) {
  const { scale, pan, panResponder } = useImageZoom(onZoomStart);
  const { theme } = useTheme();

  return (
    <View style={[styles.imageWrapper, { backgroundColor: theme.panel }]}>
      {imageUrl && (
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: imageWidth,
              height: imageHeight,
              transform: [
                { scale },
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      {loading && (
        <ActivityIndicator 
          size="large" 
          style={styles.loadingIndicator} 
          color={theme.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
}); 