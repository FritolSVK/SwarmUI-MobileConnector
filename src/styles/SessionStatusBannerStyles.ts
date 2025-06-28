import { StyleSheet } from 'react-native';

const SessionStatusBannerStyles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SessionStatusBannerStyles; 