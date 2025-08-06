import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewToken } from 'react-native';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, Image, ListRenderItem, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ImageHistoryStyles from '../../styles/ImageHistoryStyles';
import { HistoryImage } from '../../types/HistoryImage';
import ArrowButton from '../ui/ArrowButton';
import ImageViewer from '../ui/ImageViewer';

interface ImageHistoryProps {
  images: HistoryImage[];
  onImagePress?: (image: HistoryImage) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRefreshImage?: (imageId: string) => void;
  onLoadMore?: () => void;
  loadImageData?: (imageId: string) => void;
  releaseImageData?: (imageId: string) => void;
  noSession?: boolean;
  isLoadingThumbnails?: boolean;
}

export default function ImageHistory({ 
  images, 
  onImagePress, 
  loading = false, 
  loadingMore = false,
  hasMore = false,
  error = null, 
  onRefresh, 
  onRefreshImage,
  onLoadMore,
  loadImageData,
  releaseImageData,
  noSession = false,
  isLoadingThumbnails = false
}: ImageHistoryProps) {
  const [selectedImage, setSelectedImage] = useState<HistoryImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const bottomPanelAnim = useRef(new Animated.Value(1)).current; // 1 = shown, 0 = hidden
  const hasLoadedOnceRef = useRef(false);
  const { theme } = useTheme();

  // Track which images are visible
  const viewableIdsRef = useRef<Set<string>>(new Set());

  // Mark as loaded once when images are first loaded
  useEffect(() => {
    if (images.length > 0 && !hasLoadedOnceRef.current) {
      hasLoadedOnceRef.current = true;
    }
  }, [images.length]);

  useEffect(() => {
    Animated.timing(bottomPanelAnim, {
      toValue: showBottomPanel ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showBottomPanel, bottomPanelAnim]);

  const onViewableItemsChanged = useCallback(({ viewableItems, changed }: { viewableItems: ViewToken[], changed: ViewToken[] }) => {
    const newVisibleIds = new Set(viewableItems.map(v => v.item.id));
    
    // Load imageData for newly visible images (but not failed ones)
    viewableItems.forEach(v => {
      if (loadImageData && v.item.id && !v.item.imageData && !v.item.thumbnailFailed) {
        // Only load HD data if we have a thumbnail to show first
        if (v.item.thumbnailUri) {
          loadImageData(v.item.id);
        }
      }
    });
    
    // Release imageData for images that are no longer visible
    viewableIdsRef.current.forEach(id => {
      if (!newVisibleIds.has(id) && releaseImageData) {
        releaseImageData(id);
      }
    });
    viewableIdsRef.current = newVisibleIds;
  }, [loadImageData, releaseImageData]);

  const handleImagePress = (image: HistoryImage) => {
    if (showModal && selectedImage?.id === image.id) {
      closeModal();
    } else {
      setSelectedImage(image);
      setShowModal(true);
      
      // Automatically load HD image data when opening in modal if not already loaded
      if (loadImageData && image.id && !image.imageData && !image.thumbnailFailed && image.thumbnailUri) {
        loadImageData(image.id);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderImageTile: ListRenderItem<HistoryImage> = ({ item, index }) => {
    const isImageLoading = !item.thumbnailUri && !item.thumbnailFailed;
    const isImageFailed = item.thumbnailFailed;
    
    const handleImageError = () => {
      console.warn('Failed to load thumbnail for image:', item.id);
    };

    // New: handle press differently for failed images
    const handleTilePress = () => {
      if (isImageFailed && onRefreshImage) {
        onRefreshImage(item.id);
      } else {
        handleImagePress(item);
      }
    };

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        style={[
          ImageHistoryStyles.imageTile,
          { backgroundColor: theme.panel, borderColor: theme.border }
        ]}
        onPress={handleTilePress}
      >
        <View style={ImageHistoryStyles.imageContainer}>
          {isImageLoading ? (
            <View style={[ImageHistoryStyles.imageLoadingContainer, { backgroundColor: theme.panel }]}> 
              <ActivityIndicator size="small" color={theme.accent} />
            </View>
          ) : isImageFailed ? (
            <View style={[ImageHistoryStyles.imageFailedContainer, { backgroundColor: theme.panel }]}> 
              <Text style={[ImageHistoryStyles.failedText, { color: theme.secondaryText }]}>✕</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.thumbnailUri || item.url }}
              style={ImageHistoryStyles.thumbnailImage}
              resizeMode="contain"
              onError={handleImageError}
              defaultSource={require('../../../assets/images/icon.png')} // Fallback image
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLoadMoreIndicator = () => {
    if (!hasMore) return null;
    return (
      <View style={ImageHistoryStyles.loadMoreContainer}>
        {loadingMore ? (
          <>
            <ActivityIndicator size="small" color={theme.accent} />
            <Text style={ImageHistoryStyles.loadMoreText}>Loading more images...</Text>
          </>
        ) : (
          <TouchableOpacity 
            style={[ImageHistoryStyles.loadMoreButton, { backgroundColor: theme.accent }]}
            onPress={onLoadMore}
            disabled={loadingMore}
          >
            <Text style={[ImageHistoryStyles.loadMoreButtonText, { color: theme.background }]}>
              Load More Images
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={ImageHistoryStyles.emptyContainer}>
      <Text style={[ImageHistoryStyles.emptyText, { color: theme.secondaryText }]}>No images found</Text>
      <Text style={[ImageHistoryStyles.emptySubtext, { color: theme.text }]}>Generate your first image to see it here</Text>
    </View>
  );

  if (error) {
    return (
      <View style={ImageHistoryStyles.errorContainer}>
        <Text style={[ImageHistoryStyles.errorText, { color: theme.secondaryText }]}>Failed to load images</Text>
        <Text style={[ImageHistoryStyles.errorSubtext, { color: theme.text }]}>{error}</Text>
        {onRefresh && (
          <TouchableOpacity 
            style={[ImageHistoryStyles.retryButton, { backgroundColor: theme.accent }]} 
            onPress={onRefresh}
          >
            <Text style={[ImageHistoryStyles.retryButtonText, { color: theme.background }]}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[ImageHistoryStyles.container, { backgroundColor: theme.background }]}>
      {noSession && images.length > 0 && (
        <View style={[ImageHistoryStyles.loadMoreContainer, ImageHistoryStyles.offlineModeContainer, { backgroundColor: theme.panel }]}>
          <Text style={[ImageHistoryStyles.loadMoreText, ImageHistoryStyles.offlineModeText, { color: theme.secondaryText }]}>
            Offline Mode - Showing {images.filter(img => img.thumbnailUri).length} loaded images
          </Text>
        </View>
      )}
      <FlatList
        data={images}
        renderItem={renderImageTile}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={ImageHistoryStyles.flatListColumnWrapper}
        contentContainerStyle={[ImageHistoryStyles.scrollContent, { backgroundColor: theme.background }]}
        ListFooterComponent={renderLoadMoreIndicator}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={false}
        onRefresh={() => {
          console.log('ImageHistory: onRefresh triggered from FlatList');
          if (onRefresh) {
            onRefresh();
          }
        }}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        windowSize={5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        removeClippedSubviews={true}
      />
      <Modal
        visible={showModal}
        transparent={false}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={[ImageHistoryStyles.modalContent, { backgroundColor: theme.background }]}> 
          <TouchableOpacity
            onPress={closeModal}
            style={[
              ImageHistoryStyles.modalCloseButton,
              {
                backgroundColor: theme.background,
                shadowColor: theme.shadow,
              }
            ]}
          >
            <Text style={[ImageHistoryStyles.modalCloseButtonText, { color: theme.accent }]}>✕</Text>
          </TouchableOpacity>
          <View style={ImageHistoryStyles.modalScrollWrapper}>
            <View style={[ImageHistoryStyles.modalImageWrapper, { backgroundColor: theme.background }]}> 
              {selectedImage && (
                <ImageViewer
                  imageUrl={selectedImage.imageData || selectedImage.thumbnailUri || selectedImage.url}
                  loading={!selectedImage.imageData && !selectedImage.thumbnailUri}
                  imageWidth={Dimensions.get('window').width}
                  imageHeight={Dimensions.get('window').height - 200}
                  onZoomStart={() => setShowBottomPanel(false)}
                />
              )}
            </View>
            <View style={ImageHistoryStyles.arrowButtonContainer}>
              <ArrowButton
                direction={showBottomPanel ? 'down' : 'up'}
                side="center"
                onPress={() => { setShowBottomPanel(prev => !prev); }}
              />
              {onRefreshImage && selectedImage?.id && (
                <TouchableOpacity
                  style={[
                    ImageHistoryStyles.reloadButton,
                    { backgroundColor: theme.buttonBackground, borderColor: theme.border, borderWidth: 1 }
                  ]}
                  onPress={() => onRefreshImage(selectedImage.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[ImageHistoryStyles.reloadButtonText, { color: theme.accent }]}>
                    ↻
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {selectedImage && showBottomPanel && (
              <View
                style={[
                  ImageHistoryStyles.parameterListBottom,
                  {
                    backgroundColor: theme.panel,
                    borderTopColor: theme.border,
                  },
                ]}
              >
                {selectedImage.prompt && (
                  <Text style={[ImageHistoryStyles.parameterItem, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Prompt:</Text> {selectedImage.prompt}</Text>
                )}
                {selectedImage.negativePrompt && (
                  <Text style={[ImageHistoryStyles.parameterItem, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Negative Prompt:</Text> {selectedImage.negativePrompt}</Text>
                )}
                {(selectedImage.width !== undefined || selectedImage.height !== undefined) && (
                  <View style={ImageHistoryStyles.rowParams}>
                    {selectedImage.width !== undefined && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Width:</Text> {selectedImage.width}</Text>
                    )}
                    {selectedImage.height !== undefined && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Height:</Text> {selectedImage.height}</Text>
                    )}
                  </View>
                )}
                {(selectedImage.steps !== undefined || selectedImage.cfgscale !== undefined) && (
                  <View style={ImageHistoryStyles.rowParams}>
                    {selectedImage.steps !== undefined && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Steps:</Text> {selectedImage.steps}</Text>
                    )}
                    {selectedImage.cfgscale !== undefined && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>CFG Scale:</Text> {selectedImage.cfgscale}</Text>
                    )}
                  </View>
                )}
                {(selectedImage.sampler || selectedImage.scheduler) && (
                  <View style={ImageHistoryStyles.rowParams}>
                    {selectedImage.sampler && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Sampler:</Text> {selectedImage.sampler}</Text>
                    )}
                    {selectedImage.scheduler && (
                      <Text style={[ImageHistoryStyles.parameterItemInline, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Scheduler:</Text> {selectedImage.scheduler}</Text>
                    )}
                  </View>
                )}
                {selectedImage.seed !== undefined && (
                  <Text style={[ImageHistoryStyles.parameterItem, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Seed:</Text> {selectedImage.seed}</Text>
                )}
                {selectedImage.modelFile && (
                  <Text style={[ImageHistoryStyles.parameterItem, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Model File:</Text> {selectedImage.modelFile}</Text>
                )}
                {selectedImage.date && (
                  <Text style={[ImageHistoryStyles.parameterItem, { color: theme.text }]}><Text style={[ImageHistoryStyles.parameterLabel, { color: theme.secondaryText }]}>Date:</Text> {selectedImage.date}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
} 