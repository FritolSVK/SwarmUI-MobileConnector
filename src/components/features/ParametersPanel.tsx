import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { PANEL_EXPANDED_HEIGHT } from '../../hooks/useSidePanel';
import { useTheme } from '../../hooks/useTheme';
import SidePanelStyles from '../../styles/SidePanelStyles';
import { SidePanelProps } from '../../types/SidePanelProps';
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

  return (
    <View style={{ alignItems: 'center', width: '100%', backgroundColor: theme.panel }}>
      <TouchableOpacity
        style={[SidePanelStyles.arrowButton, { marginTop: 0, marginBottom: -18, zIndex: 10, backgroundColor: theme.background, borderColor: theme.border }]}
        onPress={() => setShowSidePanel(!showSidePanel)}
        activeOpacity={0.8}
      >
        <Text style={[SidePanelStyles.arrowText, { color: theme.accent }]}>{showSidePanel ? '▼' : '▲'}</Text>
      </TouchableOpacity>
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
          {/* Core Parameters Section */}
          <TouchableOpacity onPress={() => setShowCoreParams(!showCoreParams)} style={[SidePanelStyles.sectionHeader, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <Text style={[SidePanelStyles.sectionHeaderText, { color: theme.text }]}>Core Parameters</Text>
            <Text style={[SidePanelStyles.sectionHeaderToggle, { color: theme.accent }]}>{showCoreParams ? '-' : '+'}</Text>
          </TouchableOpacity>
          {showCoreParams && (
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
          )}

          {/* Sampling Section */}
          <TouchableOpacity onPress={() => setShowSampling(!showSampling)} style={[SidePanelStyles.sectionHeader, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <Text style={[SidePanelStyles.sectionHeaderText, { color: theme.text }]}>Sampling</Text>
            <Text style={[SidePanelStyles.sectionHeaderToggle, { color: theme.accent }]}>{showSampling ? '-' : '+'}</Text>
          </TouchableOpacity>
          {showSampling && (
            <SamplingSection
              sampler={sampler}
              setSampler={setSampler}
              scheduler={scheduler}
              setScheduler={setScheduler}
              loading={loading}
            />
          )}

          {/* Resolution Section */}
          <TouchableOpacity onPress={() => setShowResolution(!showResolution)} style={[SidePanelStyles.sectionHeader, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <Text style={[SidePanelStyles.sectionHeaderText, { color: theme.text }]}>Resolution</Text>
            <Text style={[SidePanelStyles.sectionHeaderToggle, { color: theme.accent }]}>{showResolution ? '-' : '+'}</Text>
          </TouchableOpacity>
          {showResolution && (
            <ResolutionSection
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              width={width}
              height={height}
              loading={loading}
            />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default ParametersPanel; 