import { useEffect, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageHistory, ImageViewer, NavigationHeader, PromptInput, Settings } from '../components';
import { NavigationTab } from '../components/features/NavigationHeader';
import ParametersPanel from '../components/features/ParametersPanel';
import SessionStatusBanner from '../components/features/SessionStatusBanner';
import { useSession } from '../contexts/SessionContext';
import { useImageGeneration, useImageHistory, useSidePanel } from '../hooks';
import { HistoryImage } from '../hooks/useImageHistory';
import { useTheme } from '../hooks/useTheme';
import HomeScreenStyles from '../styles/HomeScreenStyles';
import { calculateImageDimensions } from '../utils/imageUtils';
import { loadUserSettings, saveUserSettings } from '../utils/storage';

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
    isLoadingThumbnails,
    refreshImages,
    refreshImage,
    loadMoreImages,
    fetchImages,
    loadImageData,
    releaseImageData,
    totalCount,
    loadedThumbnailCount,
  } = useImageHistory();

  const [images, setImages] = useState<number>(1);
  const [seed, setSeed] = useState<number>(-1);
  const [aspectRatio, setAspectRatio] = useState<string>('2:3');
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(768);
  const [showResolution, setShowResolution] = useState<boolean>(false);

  const { sessionId } = useSession();

  // Load user settings on app start
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadUserSettings();
        if (settings.prompt) setPrompt(settings.prompt);
        if (settings.sampler) setSampler(settings.sampler);
        if (settings.scheduler) setScheduler(settings.scheduler);
        if (settings.steps !== undefined) setSteps(settings.steps);
        if (settings.cfgScale !== undefined) setCfgScale(settings.cfgScale);
        if (settings.images !== undefined) setImages(settings.images);
        if (settings.seed !== undefined) setSeed(settings.seed);
        if (settings.aspectRatio) setAspectRatio(settings.aspectRatio);
        if (settings.width !== undefined) setWidth(settings.width);
        if (settings.height !== undefined) setHeight(settings.height);
        if (settings.showCoreParams !== undefined) setShowCoreParams(settings.showCoreParams);
        if (settings.showSampling !== undefined) setShowSampling(settings.showSampling);
        if (settings.showResolution !== undefined) setShowResolution(settings.showResolution);
        if (settings.showSidePanel !== undefined) setShowSidePanel(settings.showSidePanel);
      } catch (error) {
        console.warn('Failed to load user settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await saveUserSettings({
          prompt,
          sampler,
          scheduler,
          steps,
          cfgScale,
          images,
          seed,
          aspectRatio,
          width,
          height,
          showCoreParams,
          showSampling,
          showResolution,
          showSidePanel,
        });
      } catch (error) {
        console.warn('Failed to save user settings:', error);
      }
    };
    saveSettings();
  }, [prompt, sampler, scheduler, steps, cfgScale, images, seed, aspectRatio, width, height, showCoreParams, showSampling, showResolution, showSidePanel]);

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

  // Only load images when the history tab is opened and sessionId exists
  useEffect(() => {
    if (activeTab === 'history' && historyImages.length === 0 && sessionId) {
      fetchImages();
    }
  }, [activeTab, historyImages.length, fetchImages, sessionId]);

  const handleGenerateImage = async () => {
    if (!sessionId) return;
    await generateImage({
      images,
      seed,
      width,
      height,
    });
    console.log('handleGenerateImage: calling refreshImages...');
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
          <Text style={HomeScreenStyles.simpleStatusText}>
            Generating...
          </Text>
        );
      } else if (isGenerating && pendingCount > 0) {
        // Currently generating and more in queue
        return (
          <View>
            <Text style={HomeScreenStyles.simpleStatusText}>
              Generating...
            </Text>
            <Text style={HomeScreenStyles.simpleStatusText}>
              {pendingCount} more queued
            </Text>
          </View>
        );
      } else {
        // Queued but not currently generating
        return (
          <Text style={HomeScreenStyles.simpleStatusText}>
            Queued ({pendingCount} pending)
          </Text>
        );
      }
    }
    return null;
  };

  const renderMainContent = () => (
    <View style={[HomeScreenStyles.verticalColumn, { justifyContent: 'space-between' }]}>
      <View style={[HomeScreenStyles.imageWrapper, { height: imageAreaHeight, flex: 1 }]}> 
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
      <View >
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateImage}
          loading={!sessionId || false}
          generationStatus={renderSimpleStatus()}
          disabled={!sessionId}
        />
      </View>
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
            hasMore={sessionId ? historyHasMore : false}
            error={historyError}
            onRefresh={() => {
              console.log('HomeScreen: onRefresh called, sessionId:', !!sessionId);
              refreshImages();
            }}
            onRefreshImage={refreshImage}
            onLoadMore={sessionId ? loadMoreImages : undefined}
            loadImageData={loadImageData}
            releaseImageData={releaseImageData}
            noSession={!sessionId}
            isLoadingThumbnails={isLoadingThumbnails}
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[HomeScreenStyles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <SessionStatusBanner />
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        galleryCount={loadedThumbnailCount}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 100}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{ flex: 1, paddingTop: 36 }}>
            {renderContent()}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
