import { StyleSheet } from 'react-native';
import { darkTheme } from '../constants/colors';

const SessionContextStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkTheme.background,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: darkTheme.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkTheme.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: darkTheme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    textAlign: 'center',
  },
});

export default SessionContextStyles; 