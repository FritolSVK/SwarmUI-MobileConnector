import React, { useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SAMPLER_OPTIONS, SCHEDULER_OPTIONS } from '../../constants/config';
import { useTheme } from '../../hooks/useTheme';
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
      <DropDownPicker
        open={samplerOpen}
        setOpen={setSamplerOpen}
        value={sampler}
        setValue={setSampler}
        items={samplerItems}
        disabled={loading}
        style={{ backgroundColor: theme.panel, borderColor: theme.border }}
        dropDownContainerStyle={{ backgroundColor: theme.panel, borderColor: theme.border }}
        textStyle={{ color: theme.text }}
        listItemContainerStyle={{ backgroundColor: theme.panel }}
        selectedItemContainerStyle={{ backgroundColor: theme.accent + '22' }}
        selectedItemLabelStyle={{ color: theme.accent, fontWeight: 'bold' }}
        placeholderStyle={{ color: theme.secondaryText }}
        modalContentContainerStyle={{ backgroundColor: theme.panel }}
        placeholder="Select Sampler"
        zIndex={2000}
        zIndexInverse={2000}
      />
      <DropDownPicker
        open={schedulerOpen}
        setOpen={setSchedulerOpen}
        value={scheduler}
        setValue={setScheduler}
        items={schedulerItems}
        disabled={loading}
        style={{ backgroundColor: theme.panel, borderColor: theme.border, marginTop: 12 }}
        dropDownContainerStyle={{ backgroundColor: theme.panel, borderColor: theme.border }}
        textStyle={{ color: theme.text }}
        listItemContainerStyle={{ backgroundColor: theme.panel }}
        selectedItemContainerStyle={{ backgroundColor: theme.accent + '22' }}
        selectedItemLabelStyle={{ color: theme.accent, fontWeight: 'bold' }}
        placeholderStyle={{ color: theme.secondaryText }}
        modalContentContainerStyle={{ backgroundColor: theme.panel }}
        placeholder="Select Scheduler"
        zIndex={1000}
        zIndexInverse={1000}
      />
    </View>
  );
} 