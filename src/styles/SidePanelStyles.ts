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
  arrowButton: {
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
    marginTop: -18,
    alignSelf: 'center',
  },
  arrowText: {
    fontSize: 22,
    fontWeight: 'bold',
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
});

export default SidePanelStyles; 