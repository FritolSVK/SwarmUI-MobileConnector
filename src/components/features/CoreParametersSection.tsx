import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SLIDER_CONFIG } from '../../constants/config';
import { useTheme } from '../../hooks/useTheme';
import CoreParametersSectionStyles from '../../styles/CoreParametersSectionStyles';
import { CoreParametersSectionProps } from '../../types/CoreParametersSectionProps';

export default function CoreParametersSection({ steps, setSteps, cfgScale, setCfgScale, loading, images, setImages, seed, setSeed }: CoreParametersSectionProps) {
  const { theme } = useTheme();
  return (
    <View style={[CoreParametersSectionStyles.card, { backgroundColor: theme.panel }]}>
      {/* Images */}
      <View style={CoreParametersSectionStyles.sliderContainer}>
        <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text }]}>Images: <Text style={[CoreParametersSectionStyles.sliderValue, { color: theme.accent }]}>{images}</Text></Text>
        <Slider
          style={CoreParametersSectionStyles.fullWidthSlider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={images}
          onValueChange={setImages}
          disabled={loading}
          minimumTrackTintColor={theme.accent}
          thumbTintColor={theme.accent}
        />
      </View>
      {/* Seed */}
      <View style={CoreParametersSectionStyles.sliderContainer}>
        <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text }]}>Seed:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[CoreParametersSectionStyles.fullWidthSlider, { color: theme.text, borderColor: theme.border, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, height: 36, flex: 1 }]}
            keyboardType="numeric"
            value={seed.toString()}
            onChangeText={text => setSeed(Number(text.replace(/[^0-9-]/g, '')))}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setSeed(-1)}
            disabled={loading}
            style={{ padding: 8, opacity: loading ? 0.5 : 1, marginLeft: 8 }}
          >
            <FontAwesome5 name="dice-three" size={22} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Steps */}
      <View style={CoreParametersSectionStyles.sliderContainer}>
        <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text }]}>Steps: <Text style={[CoreParametersSectionStyles.sliderValue, { color: theme.accent }]}>{steps}</Text></Text>
        <Slider
          style={CoreParametersSectionStyles.fullWidthSlider}
          minimumValue={SLIDER_CONFIG.STEPS.MIN}
          maximumValue={SLIDER_CONFIG.STEPS.MAX}
          step={SLIDER_CONFIG.STEPS.STEP}
          value={steps}
          onValueChange={setSteps}
          disabled={loading}
          minimumTrackTintColor={theme.accent}
          thumbTintColor={theme.accent}
        />
      </View>
      {/* CFG Scale */}
      <View style={CoreParametersSectionStyles.sliderContainer}>
        <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text }]}>CFG Scale: <Text style={[CoreParametersSectionStyles.sliderValue, { color: theme.accent }]}>{cfgScale}</Text></Text>
        <Slider
          style={CoreParametersSectionStyles.fullWidthSlider}
          minimumValue={SLIDER_CONFIG.CFG_SCALE.MIN}
          maximumValue={SLIDER_CONFIG.CFG_SCALE.MAX}
          step={SLIDER_CONFIG.CFG_SCALE.STEP}
          value={cfgScale}
          onValueChange={setCfgScale}
          disabled={loading}
          minimumTrackTintColor={theme.accent}
          thumbTintColor={theme.accent}
        />
      </View>
    </View>
  );
} 