import { Dimensions, StyleSheet } from 'react-native';

const ImageHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    marginRight: 56,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageTile: {
    width: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  thumbnailImage: {
    width: 120,
    height: 120,
  },
  imageInfo: {
    padding: 8,
  },
  promptText: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 4,
    lineHeight: 16,
  },
  timestampText: {
    fontSize: 10,
    color: '#6c757d',
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
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
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
    color: '#6c757d',
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
    color: '#6c757d',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  imageLoadingContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imageLoadingText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
  },
  loadMoreContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 12,
    color: '#6c757d',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  parameterItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
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
    shadowColor: '#000',
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
    color: '#495057',
    marginRight: 24,
  },
});

export default ImageHistoryStyles; 