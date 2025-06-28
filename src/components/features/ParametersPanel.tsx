import { useEffect, useRef } from 'react';
import { Animated, Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { PANEL_EXPANDED_HEIGHT } from '../../hooks/useSidePanel';
import { useTheme } from '../../hooks/useTheme';
import SidePanelStyles from '../../styles/SidePanelStyles';
import { SidePanelProps } from '../../types/SidePanelProps';
import ArrowButton from '../ui/ArrowButton';
import CoreParametersSection from './CoreParametersSection';
import ResolutionSection from './ResolutionSection';
import SamplingSection from './SamplingSection';

const { width: screenWidth } = Dimensions.get('window');

function ParametersPanel({
  showCoreParams,
  setShowCoreParams,
  showSampling,
  setShowSampling,
  steps,
  setSteps,
  cfgScale,
  setCfgScale,
  loading,
  sampler,
  setSampler,
  scheduler,
  setScheduler,
  showSidePanel,
  setShowSidePanel,
  slideYAnim,
  heightAnim,
  images,
  setImages,
  seed,
  setSeed,
  aspectRatio,
  setAspectRatio,
  width,
  height,
  showResolution,
  setShowResolution,
}: SidePanelProps & {
  slideYAnim: Animated.Value;
  heightAnim: Animated.Value;
  showResolution: boolean;
  setShowResolution: (value: boolean) => void;
}) {
  const { theme } = useTheme();
  const animationDuration = 300; // match UI_CONFIG.ANIMATION_DURATION

  // Animated value for content opacity
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(contentOpacity, {
      toValue: showSidePanel ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [showSidePanel, contentOpacity]);

  // Create data array for FlatList
  const renderSections = () => {
    const sections = [];

    // Core Parameters Section
    sections.push({
      id: 'core-params-header',
      type: 'header',
      title: 'Core Parameters',
      isExpanded: showCoreParams,
      onToggle: () => setShowCoreParams(!showCoreParams),
    });

    if (showCoreParams) {
      sections.push({
        id: 'core-params-content',
        type: 'core-params',
      });
    }

    // Sampling Section
    sections.push({
      id: 'sampling-header',
      type: 'header',
      title: 'Sampling',
      isExpanded: showSampling,
      onToggle: () => setShowSampling(!showSampling),
    });

    if (showSampling) {
      sections.push({
        id: 'sampling-content',
        type: 'sampling',
      });
    }

    // Resolution Section
    sections.push({
      id: 'resolution-header',
      type: 'header',
      title: 'Resolution',
      isExpanded: showResolution,
      onToggle: () => setShowResolution(!showResolution),
    });

    if (showResolution) {
      sections.push({
        id: 'resolution-content',
        type: 'resolution',
      });
    }

    return sections;
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return (
        <TouchableOpacity 
          onPress={item.onToggle} 
          style={[SidePanelStyles.sectionHeader, { backgroundColor: theme.panel, borderColor: theme.border }]}
        >
          <Text style={[SidePanelStyles.sectionHeaderText, { color: theme.text }]}>{item.title}</Text>
          <Text style={[SidePanelStyles.sectionHeaderToggle, { color: theme.accent }]}>{item.isExpanded ? '-' : '+'}</Text>
        </TouchableOpacity>
      );
    }

    if (item.type === 'core-params') {
      return (
        <CoreParametersSection
          steps={steps}
          setSteps={setSteps}
          cfgScale={cfgScale}
          setCfgScale={setCfgScale}
          loading={loading}
          images={images}
          setImages={setImages}
          seed={seed}
          setSeed={setSeed}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          width={width}
          height={height}
        />
      );
    }

    if (item.type === 'sampling') {
      return (
        <SamplingSection
          sampler={sampler}
          setSampler={setSampler}
          scheduler={scheduler}
          setScheduler={setScheduler}
          loading={loading}
        />
      );
    }

    if (item.type === 'resolution') {
      return (
        <ResolutionSection
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          width={width}
          height={height}
          loading={loading}
        />
      );
    }

    return null;
  };

  return (
    <View style={[SidePanelStyles.parametersContainer, { backgroundColor: theme.panel }]}>
      <Animated.View
        style={[
          SidePanelStyles.arrowButtonContainer,
          {
            transform: [{ translateY: slideYAnim }],
          }
        ]}
      >
        <ArrowButton
          direction={showSidePanel ? 'down' : 'up'}
          onPress={() => setShowSidePanel(!showSidePanel)}
          side="center"
        />
      </Animated.View>
      <Animated.View
        style={[
          SidePanelStyles.bottomPanel,
          {
            height: heightAnim,
            maxHeight: PANEL_EXPANDED_HEIGHT,
            minHeight: 0,
            transform: [{ translateY: slideYAnim }],
            backgroundColor: theme.panel,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            overflow: 'hidden',
            opacity: showSidePanel ? 1 : 0,
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
      >
        <Animated.View
          style={[
            SidePanelStyles.panelContent,
            { opacity: contentOpacity },
          ]}
          pointerEvents={showSidePanel ? 'auto' : 'none'}
        >
          <FlatList
            data={renderSections()}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={SidePanelStyles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default ParametersPanel; 