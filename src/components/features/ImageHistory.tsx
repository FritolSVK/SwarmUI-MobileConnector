import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewToken } from 'react-native';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, Image, ListRenderItem, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ImageHistoryStyles from '../../styles/ImageHistoryStyles';
import SidePanelStyles from '../../styles/SidePanelStyles';
import { HistoryImage } from '../../types/HistoryImage';
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
  releaseImageData
}: ImageHistoryProps) {
  const [selectedImage, setSelectedImage] = useState<HistoryImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const bottomPanelAnim = useRef(new Animated.Value(1)).current; // 1 = shown, 0 = hidden
  const { theme } = useTheme();

  // Track which images are visible
  const viewableIdsRef = useRef<Set<string>>(new Set());

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
    // Load imageData for newly visible images
    viewableItems.forEach(v => {
      if (loadImageData && v.item.id && !v.item.imageData) {
        loadImageData(v.item.id);
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
    const isImageLoading = !item.thumbnailUri && !loading;
    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        style={[
          ImageHistoryStyles.imageTile,
          { backgroundColor: theme.panel, borderColor: theme.border }
        ]}
        onPress={() => handleImagePress(item)}
      >
        {isImageLoading ? (
          <View style={[ImageHistoryStyles.imageLoadingContainer, { backgroundColor: theme.panel }]}> 
            <ActivityIndicator size="small" color={theme.accent} />
          </View>
        ) : (
          <Image
            source={{ uri: item.thumbnailUri || item.url }}
            style={ImageHistoryStyles.thumbnailImage}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderLoadMoreIndicator = () => {
    if (!hasMore) return null;
    return (
      <View style={ImageHistoryStyles.loadMoreContainer}>
        {loadingMore ? (
          <>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={ImageHistoryStyles.loadMoreText}>Loading more images...</Text>
          </>
        ) : (
          <Text style={ImageHistoryStyles.loadMoreText}>Scroll to load more</Text>
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

  if (loading) {
    return (
      <View style={ImageHistoryStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[ImageHistoryStyles.loadingText, { color: theme.text }]}>Loading images...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={ImageHistoryStyles.errorContainer}>
        <Text style={[ImageHistoryStyles.errorText, { color: theme.secondaryText }]}>Failed to load images</Text>
        <Text style={[ImageHistoryStyles.errorSubtext, { color: theme.text }]}>{error}</Text>
        {onRefresh && (
          <TouchableOpacity style={ImageHistoryStyles.retryButton} onPress={onRefresh}>
            <Text style={[ImageHistoryStyles.retryButtonText, { color: theme.text }]}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[ImageHistoryStyles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={images}
        renderItem={renderImageTile}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={[ImageHistoryStyles.scrollContent, { backgroundColor: theme.background }]}
        onEndReached={hasMore && !loadingMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderLoadMoreIndicator}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={onRefresh}
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
            style={{
              position: 'absolute',
              top: 32,
              right: 24,
              zIndex: 20,
              backgroundColor: theme.background,
              borderRadius: 24,
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{ color: theme.accent, fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}>✕</Text>
          </TouchableOpacity>
          <View style={ImageHistoryStyles.modalScrollWrapper}>
            <View style={[ImageHistoryStyles.modalImageWrapper, { backgroundColor: theme.background }]}> 
              {selectedImage && (
                <ImageViewer
                  imageUrl={selectedImage.imageData || selectedImage.url}
                  loading={false}
                  imageWidth={Dimensions.get('window').width}
                  imageHeight={Dimensions.get('window').height - 200}
                  onZoomStart={() => setShowBottomPanel(false)}
                />
              )}
            </View>
            <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 0, zIndex: 10 }}>
              <TouchableOpacity
                style={[
                  SidePanelStyles.arrowButton,
                  { backgroundColor: theme.panel, borderColor: theme.border, marginBottom: 0 }
                ]}
                onPress={() => { setShowBottomPanel(prev => !prev); }}
                activeOpacity={0.8}
              >
                <Text style={[SidePanelStyles.arrowText, { color: theme.accent }]}>{showBottomPanel ? '▼' : '▲'}</Text>
              </TouchableOpacity>
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