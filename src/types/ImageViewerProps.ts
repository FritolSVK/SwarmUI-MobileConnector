export interface ImageViewerProps {
  imageUrl: string | null;
  loading: boolean;
  onImagePress?: () => void;
  imageWidth?: number;
  imageHeight?: number;
  onZoomStart?: () => void;
} 