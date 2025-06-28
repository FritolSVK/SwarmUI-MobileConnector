import { Dimensions, StyleSheet } from 'react-native';
import { lightTheme } from '../constants/colors';

const ImageHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    marginRight: 56,
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageTile: {
    width: 120,
    backgroundColor: lightTheme.gray[100],
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  imageInfo: {
    padding: 8,
  },
  promptText: {
    fontSize: 12,
    color: lightTheme.gray[700],
    marginBottom: 4,
    lineHeight: 16,
  },
  timestampText: {
    fontSize: 10,
    color: lightTheme.gray[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.gray[600],
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: lightTheme.gray[500],
    textAlign: 'center',
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.gray[600],
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightTheme.gray[600],
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: lightTheme.gray[500],
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: lightTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: lightTheme.white,
    fontSize: 16,
    fontWeight: '600',
  },
  imageLoadingContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.gray[100],
  },
  imageLoadingText: {
    fontSize: 12,
    color: lightTheme.gray[600],
    marginTop: 8,
  },
  loadMoreContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 12,
    color: lightTheme.gray[600],
  },
  fullScreenModalTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  fullScreenImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parameterList: {
    padding: 16,
    backgroundColor: lightTheme.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  parameterItem: {
    fontSize: 14,
    color: lightTheme.gray[700],
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: lightTheme.gray[600],
    marginRight: 8,
  },
  modalContent: {
    flex: 1,
    // backgroundColor will be set from the component using theme
    paddingTop: 0,
  },
  modalScrollWrapper: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  modalImageWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor will be set from the component using theme if needed
  },
  modalImage: {
    width: '100%',
    height: undefined,
    flex: 1,
    // backgroundColor will be set from the component using theme if needed
  },
  parameterListBottom: {
    width: '100%',
    // backgroundColor will be set from the component using theme
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
    shadowColor: lightTheme.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  rowParams: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    gap: 24,
  },
  parameterItemInline: {
    fontSize: 14,
    color: lightTheme.gray[700],
    marginRight: 24,
  },
  // New styles for inline styles
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 20,
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  modalCloseButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrowButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
    zIndex: 10,
  },
  offlineModeContainer: {
    margin: 16,
    borderRadius: 8,
    padding: 12,
  },
  offlineModeText: {
    textAlign: 'center',
  },
  flatListColumnWrapper: {
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
});

export default ImageHistoryStyles; 