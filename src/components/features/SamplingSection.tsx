import React, { useState } from 'react';
import { ImageStyle, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SAMPLER_OPTIONS, SCHEDULER_OPTIONS } from '../../constants/config';
import { useTheme } from '../../hooks/useTheme';
import CoreParametersSectionStyles from '../../styles/CoreParametersSectionStyles';
import SamplingSectionStyles from '../../styles/SamplingSectionStyles';
import { SamplingSectionProps } from '../../types/SamplingSectionProps';

export default function SamplingSection({ sampler, setSampler, scheduler, setScheduler, loading }: SamplingSectionProps) {
  const { theme } = useTheme();

  // State for dropdown open/close
  const [samplerOpen, setSamplerOpen] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);

  // Convert options to DropDownPicker format
  const samplerItems = SAMPLER_OPTIONS.map(option => ({ label: option.label, value: option.value }));
  const schedulerItems = SCHEDULER_OPTIONS.map(option => ({ label: option.label, value: option.value }));

  return (
    <View style={[SamplingSectionStyles.card, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text, textAlign: 'center' }]}>Sampler</Text>
      <DropDownPicker
        open={samplerOpen}
        value={sampler}
        items={samplerItems}
        setOpen={setSamplerOpen}
        setValue={setSampler}
        disabled={loading}
        style={[SamplingSectionStyles.fullWidthPicker, { backgroundColor: theme.panel, borderColor: theme.border, borderWidth: 0 }]}
        textStyle={{ color: theme.text }}
        dropDownContainerStyle={{ backgroundColor: theme.panel, borderColor: theme.border, borderWidth: 0 }}
        listItemLabelStyle={{ color: theme.text }}
        placeholder="Select Sampler"
        placeholderStyle={{ color: theme.secondaryText }}
        arrowIconStyle={{ tintColor: theme.accent } as ImageStyle}
        tickIconStyle={{ tintColor: theme.accent } as ImageStyle}
        zIndex={2000}
        zIndexInverse={2000}
      />

      <Text style={[CoreParametersSectionStyles.sliderLabel, { color: theme.text, marginTop: 16, textAlign: 'center' }]}>Scheduler</Text>
      <DropDownPicker
        open={schedulerOpen}
        value={scheduler}
        items={schedulerItems}
        setOpen={setSchedulerOpen}
        setValue={setScheduler}
        disabled={loading}
        style={[SamplingSectionStyles.fullWidthPicker, { backgroundColor: theme.panel, borderColor: theme.border, marginTop: 12, borderWidth: 0 }]}
        textStyle={{ color: theme.text }}
        dropDownContainerStyle={{ backgroundColor: theme.panel, borderColor: theme.border, borderWidth: 0 }}
        listItemLabelStyle={{ color: theme.text }}
        placeholder="Select Scheduler"
        placeholderStyle={{ color: theme.secondaryText }}
        arrowIconStyle={{ tintColor: theme.accent } as ImageStyle}
        tickIconStyle={{ tintColor: theme.accent } as ImageStyle}
        zIndex={1000}
        zIndexInverse={1000}
      />
    </View>
  );
} 