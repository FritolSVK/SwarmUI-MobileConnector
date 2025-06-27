import { HistoryImage } from './HistoryImage';

export interface ImageHistoryProps {
  images: HistoryImage[];
  onImagePress?: (image: HistoryImage) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRefreshImage?: (imageId: string) => void;
  onLoadMore?: () => void;
} 