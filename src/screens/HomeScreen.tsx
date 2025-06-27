import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ImageHistory, ImageViewer, NavigationHeader, PromptInput, Settings } from '../components';
import { NavigationTab } from '../components/features/NavigationHeader';
import ParametersPanel from '../components/features/ParametersPanel';
import { useImageGeneration, useImageHistory, useSidePanel } from '../hooks';
import { HistoryImage } from '../hooks/useImageHistory';
import { useTheme } from '../hooks/useTheme';
import { calculateImageDimensions } from '../utils/imageUtils';

export default function HomeScreen() {
  const window = useWindowDimensions();
  const { theme } = useTheme();
  const { finalImageWidth, finalImageHeight, imageAreaHeight } = calculateImageDimensions(window.height);
  const [activeTab, setActiveTab] = useState<NavigationTab>('main');
  
  const {
    imageUrl,
    loading,
    isGenerating,
    completedGenerations,
    prompt,
    sampler,
    scheduler,
    steps,
    cfgScale,
    setPrompt,
    setSampler,
    setScheduler,
    setSteps,
    setCfgScale,
    generateImage,
    getPendingCount,
  } = useImageGeneration();

  const {
    showSidePanel,
    showCoreParams,
    showSampling,
    setShowSidePanel,
    setShowCoreParams,
    setShowSampling,
    slideYAnim,
    heightAnim,
  } = useSidePanel();

  const {
    images: historyImages,
    addImage,
    clearHistory,
    loading: historyLoading,
    loadingMore: historyLoadingMore,
    hasMore: historyHasMore,
    error: historyError,
    refreshImages,
    refreshImage,
    loadMoreImages,
    fetchImages,
    loadImageData,
    releaseImageData,
    totalCount,
  } = useImageHistory();

  const [images, setImages] = useState<number>(1);
  const [seed, setSeed] = useState<number>(-1);
  const [aspectRatio, setAspectRatio] = useState<string>('3:2');
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(768);
  const [showResolution, setShowResolution] = useState<boolean>(true);

  // Update width/height when aspectRatio changes
  useEffect(() => {
    const aspectMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 640, height: 640 },
      '4:3': { width: 720, height: 540 },
      '3:2': { width: 768, height: 528 },
      '8:5': { width: 832, height: 520 },
      '16:9': { width: 832, height: 480 },
      '21:9': { width: 864, height: 368 },
      '3:4': { width: 540, height: 720 },
      '2:3': { width: 528, height: 768 },
      '5:8': { width: 520, height: 832 },
      '9:16': { width: 480, height: 832 },
      '9:21': { width: 368, height: 864 },
    };
    const dims = aspectMap[aspectRatio] || { width: 512, height: 768 };
    setWidth(dims.width);
    setHeight(dims.height);
  }, [aspectRatio]);

  // Only load images when the history tab is opened
  useEffect(() => {
    if (activeTab === 'history' && historyImages.length === 0) {
      fetchImages();
    }
  }, [activeTab, historyImages.length, fetchImages]);

  const handleGenerateImage = async () => {
    await generateImage({
      images,
      seed,
      width,
      height,
    });
    // After generation, refresh history from the server
    refreshImages();
  };

  const handleHistoryImagePress = (image: HistoryImage) => {
    // Could implement functionality to load the image back to main screen
  };

  const renderSimpleStatus = () => {
    const pendingCount = getPendingCount();
    if (pendingCount > 0 || isGenerating) {
      if (isGenerating && pendingCount === 0) {
        // Only one image generating, no queue
        return (
          <Text style={styles.simpleStatusText}>
            Generating...
          </Text>
        );
      } else if (isGenerating && pendingCount > 0) {
        // Currently generating and more in queue
        return (
          <View>
            <Text style={styles.simpleStatusText}>
              Generating...
            </Text>
            <Text style={styles.simpleStatusText}>
              {pendingCount} more queued
            </Text>
          </View>
        );
      } else {
        // Queued but not currently generating
        return (
          <Text style={styles.simpleStatusText}>
            Queued ({pendingCount} pending)
          </Text>
        );
      }
    }
    return null;
  };

  const renderMainContent = () => (
    <View style={styles.verticalColumn}>
      <View style={[styles.imageWrapper, { height: imageAreaHeight }]}> 
        <ImageViewer
          imageUrl={imageUrl}
          loading={loading}
          onImagePress={() => {}}
          imageWidth={finalImageWidth}
          imageHeight={finalImageHeight}
        />
      </View>
      <Animated.View style={{ width: '100%', overflow: 'visible' }}>
        <ParametersPanel
          showCoreParams={showCoreParams}
          setShowCoreParams={setShowCoreParams}
          showSampling={showSampling}
          setShowSampling={setShowSampling}
          steps={steps}
          setSteps={setSteps}
          cfgScale={cfgScale}
          setCfgScale={setCfgScale}
          loading={loading}
          sampler={sampler}
          setSampler={setSampler}
          scheduler={scheduler}
          setScheduler={setScheduler}
          showSidePanel={showSidePanel}
          setShowSidePanel={setShowSidePanel}
          slideYAnim={slideYAnim}
          heightAnim={heightAnim}
          images={images}
          setImages={setImages}
          seed={seed}
          setSeed={setSeed}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          width={width}
          height={height}
          showResolution={showResolution}
          setShowResolution={setShowResolution}
        />
      </Animated.View>
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerateImage}
        loading={false}
        generationStatus={renderSimpleStatus()}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'main':
        return renderMainContent();
      case 'history':
        return (
          <ImageHistory
            images={historyImages}
            onImagePress={handleHistoryImagePress}
            loading={historyLoading}
            loadingMore={historyLoadingMore}
            hasMore={historyHasMore}
            error={historyError}
            onRefresh={refreshImages}
            onRefreshImage={refreshImage}
            onLoadMore={loadMoreImages}
            loadImageData={loadImageData}
            releaseImageData={releaseImageData}
          />
        );
      case 'settings':
        return (
          <Settings
            onClearHistory={clearHistory}
            onExportData={() => {}}
          />
        );
      default:
        return renderMainContent();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        galleryCount={totalCount}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalColumn: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  simpleStatusText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
