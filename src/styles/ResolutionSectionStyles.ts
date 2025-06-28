import { StyleSheet } from 'react-native';

const ResolutionSectionStyles = StyleSheet.create({
  aspectRatioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  aspectRatioButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  aspectRatioText: {
    // Color will be set dynamically based on theme
  },
  resolutionText: {
    marginTop: 4,
    // Color will be set dynamically based on theme
  },
});

export default ResolutionSectionStyles; 