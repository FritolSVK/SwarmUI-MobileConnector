import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const PromptInputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: lightTheme.border,
    backgroundColor: lightTheme.white,
    minHeight: 80,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderColor: lightTheme.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: lightTheme.backgroundObj.light,
    marginRight: 10,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    position: 'relative',
  },
  floatingStatus: {
    position: 'absolute',
    bottom: 60,
    right: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
    padding: 8,
    borderRadius: 6,
    minWidth: 120,
    zIndex: 1000,
  },
  generateButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: lightTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themedContainer: {
    borderTopWidth: 1,
  },
  themedInput: {
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 10,
    textAlignVertical: 'top',
  },
  themedButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themedFloatingStatus: {
    position: 'absolute',
    bottom: 60,
    right: 0,
    padding: 8,
    borderRadius: 6,
    minWidth: 120,
    zIndex: 1000,
  },
});

export default PromptInputStyles; 