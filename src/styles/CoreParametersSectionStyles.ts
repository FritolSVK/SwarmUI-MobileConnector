import { StyleSheet } from 'react-native';

const CoreParametersSectionStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#f8fafd',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
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
    color: '#333',
    marginBottom: 2,
    fontWeight: '500',
  },
  sliderValue: {
    fontWeight: '700',
    color: '#007bff',
    fontSize: 16,
    marginLeft: 4,
  },
});

export default CoreParametersSectionStyles; 