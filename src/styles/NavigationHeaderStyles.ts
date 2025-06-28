import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const NavigationHeaderStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    right: 16,
    zIndex: 1000,
  },
  threeDotsButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: lightTheme.white,
    borderWidth: 1,
    borderColor: lightTheme.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: lightTheme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 0,
    margin: 0,
    position: 'relative',
  },
  menuContainer: {
    position: 'absolute',
    top: 52,
    right: 0,
    zIndex: 999,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: lightTheme.white,
    borderWidth: 1,
    borderColor: lightTheme.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: lightTheme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 0,
    margin: 0,
    position: 'relative',
  },
  activeButton: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  iconText: {
    fontSize: 20,
    color: lightTheme.primary,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  activeIconText: {
    color: lightTheme.white,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: lightTheme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: lightTheme.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NavigationHeaderStyles; 