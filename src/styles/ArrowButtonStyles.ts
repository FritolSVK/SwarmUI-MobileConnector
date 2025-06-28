import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const ArrowButtonStyles = StyleSheet.create({
  arrowButton: {
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightTheme.borderColor,
    shadowColor: lightTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  left: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -18 }],
    zIndex: 100,
  },
  right: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -18 }],
    zIndex: 100,
  },
  leftWeb: {
    position: 'fixed',
    left: 0,
    top: '50%',
    transform: [{ translateY: -18 }],
    zIndex: 100,
  },
  rightWeb: {
    position: 'fixed',
    right: 0,
    top: '50%',
    transform: [{ translateY: -18 }],
    zIndex: 100,
  },
  centerWeb: {
    // No special positioning needed for center in normal flow
  },
  center: {
    // No special positioning needed for center in normal flow
  },
  arrowText: {
    fontSize: 22,
    color: lightTheme.primary,
    fontWeight: 'bold',
  },
});

export default ArrowButtonStyles; 