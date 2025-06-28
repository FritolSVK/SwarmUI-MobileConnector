import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const CoreParametersSectionStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: lightTheme.cardBackground,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: lightTheme.primaryText,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  fullWidthSlider: {
    width: '100%',
    height: 40,
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 16,
    color: lightTheme.text,
    marginBottom: 2,
    fontWeight: '500',
  },
  sliderValue: {
    fontWeight: '700',
    color: lightTheme.primary,
    fontSize: 16,
    marginLeft: 4,
  },
});

export default CoreParametersSectionStyles; 