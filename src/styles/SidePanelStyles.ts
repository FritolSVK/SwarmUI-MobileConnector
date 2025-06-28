import { StyleSheet } from 'react-native';

const SidePanelStyles = StyleSheet.create({
  bottomPanel: {
    width: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  panelContent: {
    width: '100%',
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginTop: 18,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'System',
  },
  sectionHeaderToggle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  parametersContainer: {
    alignItems: 'center',
    width: '100%',
  },
  arrowButtonContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  scrollViewContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
});

export default SidePanelStyles; 