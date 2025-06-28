import { StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const SettingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  content: {
    padding: 10,
    marginRight: 56,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.gray[900],
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: lightTheme.gray[900],
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: lightTheme.gray[600],
    lineHeight: 20,
  },
  button: {
    backgroundColor: lightTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: lightTheme.white,
    fontSize: 14,
    fontWeight: '500',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  themeButton: {
    backgroundColor: lightTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  themeButtonText: {
    color: lightTheme.white,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollViewContent: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  sectionTitleWithMargin: {
    marginRight: 70,
  },
  textInput: {
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    marginTop: 8,
  },
});

export default SettingsStyles; 