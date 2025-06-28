import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const HomeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalColumn: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: lightTheme.white,
  },
  simpleStatusText: {
    color: lightTheme.white,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreenStyles; 