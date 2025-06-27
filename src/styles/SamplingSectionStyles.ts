import { StyleSheet } from 'react-native';

const SamplingSectionStyles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
    elevation: 2,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  fullWidthPicker: {
    width: '100%',
    marginBottom: 2,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  pickerItem: {
    height: 44,
    fontSize: 16,
    textAlignVertical: 'center',
    paddingVertical: 8,
  },
});

export default SamplingSectionStyles; 