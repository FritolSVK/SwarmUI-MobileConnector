import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import CoreParametersSectionStyles from '../../styles/CoreParametersSectionStyles';

interface ResolutionSectionProps {
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  width: number;
  height: number;
  loading: boolean;
}

export default function ResolutionSection({ aspectRatio, setAspectRatio, width, height, loading }: ResolutionSectionProps) {
  const { theme } = useTheme();
  // Updated aspect ratios with descriptive labels
  const aspectRatios = [
    { label: '1:1 (Square)', value: '1:1', width: 640, height: 640 },
    { label: '4:3 (Old PC)', value: '4:3', width: 720, height: 540 },
    { label: '3:2 (Semi-wide)', value: '3:2', width: 768, height: 528 },
    { label: '8:5', value: '8:5', width: 832, height: 520 },
    { label: '16:9 (Standard Widescreen)', value: '16:9', width: 832, height: 480 },
    { label: '21:9 (Ultra-Widescreen)', value: '21:9', width: 864, height: 368 },
    { label: '3:4', value: '3:4', width: 540, height: 720 },
    { label: '2:3 (Semi-tall)', value: '2:3', width: 528, height: 768 },
    { label: '5:8', value: '5:8', width: 520, height: 832 },
    { label: '9:16 (Tall)', value: '9:16', width: 480, height: 832 },
    { label: '9:21 (Ultra-Tall)', value: '9:21', width: 368, height: 864 },
  ];
  // Find the selected aspect ratio object
  const selectedRatio = aspectRatios.find(r => r.value === aspectRatio);
  return (
    <View style={[CoreParametersSectionStyles.card, { backgroundColor: theme.panel }]}>  
      <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text }]}>Aspect Ratio:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {aspectRatios.map(ratio => (
          <TouchableOpacity
            key={ratio.value}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              marginRight: 8,
              marginBottom: 8,
              backgroundColor: aspectRatio === ratio.value ? theme.accent : theme.panel,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 6,
            }}
            onPress={() => setAspectRatio(ratio.value)}
            disabled={loading}
          >
            <Text style={{ color: aspectRatio === ratio.value ? theme.text : theme.accent }}>{ratio.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ color: theme.secondaryText, marginTop: 4 }}>
        Resolution: {width} x {height}
        {selectedRatio ? ` (${selectedRatio.label})` : ''}
      </Text>
    </View>
  );
} 