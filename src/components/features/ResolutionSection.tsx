import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import CoreParametersSectionStyles from '../../styles/CoreParametersSectionStyles';
import ResolutionSectionStyles from '../../styles/ResolutionSectionStyles';

interface ResolutionSectionProps {
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  width: number;
  height: number;
  loading: boolean;
}

export default function ResolutionSection({ aspectRatio, setAspectRatio, width, height, loading }: ResolutionSectionProps) {
  const { theme } = useTheme();

  const aspectRatios = [
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '3:2', value: '3:2' },
    { label: '8:5', value: '8:5' },
    { label: '16:9', value: '16:9' },
    { label: '21:9', value: '21:9' },
    { label: '3:4', value: '3:4' },
    { label: '2:3', value: '2:3' },
    { label: '5:8', value: '5:8' },
    { label: '9:16', value: '9:16' },
    { label: '9:21', value: '9:21' },
  ];

  const selectedRatio = aspectRatios.find(r => r.value === aspectRatio);

  return (
    <View style={[CoreParametersSectionStyles.card, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <View style={ResolutionSectionStyles.aspectRatioContainer}>
        {aspectRatios.map((ratio) => (
          <TouchableOpacity
            key={ratio.value}
            style={[
              ResolutionSectionStyles.aspectRatioButton,
              {
                backgroundColor: aspectRatio === ratio.value ? theme.accent : theme.panel,
                borderColor: theme.border,
              }
            ]}
            onPress={() => setAspectRatio(ratio.value)}
            disabled={loading}
          >
            <Text style={[ResolutionSectionStyles.aspectRatioText, { color: aspectRatio === ratio.value ? theme.text : theme.accent }]}>
              {ratio.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[ResolutionSectionStyles.resolutionText, { color: theme.secondaryText }]}>
        {width} × {height}
      </Text>
    </View>
  );
} 