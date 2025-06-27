import { useCallback, useState } from 'react';
import { API_CONFIG } from '../constants/config';
import { useSession } from '../contexts';
import { apiService } from '../services/api';
import { HistoryImage } from '../types/HistoryImage';
import { createAndStoreThumbnail } from '../utils/imageUtils';

// Helper to strip leading "raw/" if present
function stripRawPrefix(path: string) {
  return path.startsWith('raw/') ? path.slice(4) : path;
}

export const useImageHistory = () => {
  const [images, setImages] = useState<HistoryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [allImageFiles, setAllImageFiles] = useState<{src: string; metadata?: string}[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { sessionId } = useSession();

  const ITEMS_PER_PAGE = 20;

  const fetchImageData = useCallback(async (filename: string): Promise<string | null> => {
    try {
      return await apiService.fetchImage(filename, sessionId || undefined);
    } catch (err) {
      console.error(`Failed to fetch image ${filename}:`, err);
      return null;
    }
  }, [sessionId]);

  const processImageFiles = useCallback((files: {src: string; metadata?: string}[]) => {
    return files.map((file, index) => {
      let metaParams: any = {};
      if (file.metadata) {
        try {
          metaParams = JSON.parse(file.metadata);
        } catch (e) {
          // ignore parse errors
        }
      }
      // Flatten nested metadata
      const suiParams = metaParams.sui_image_params || {};
      const suiExtra = metaParams.sui_extra_data || {};
      const suiModels = Array.isArray(metaParams.sui_models) ? metaParams.sui_models : [];
      const cleanSrc = stripRawPrefix(file.src);
      return {
        id: `${file.src}-${index}`,
        url: `${API_CONFIG.SWARM_BASE_URL}/View/local/raw/${encodeURIComponent(cleanSrc)}`,
        filename: cleanSrc,
        prompt: suiParams.prompt ?? 'No prompt available',
        negativePrompt: suiParams.negativeprompt ?? '',
        steps: suiParams.steps,
        seed: suiParams.seed,
        cfgscale: suiParams.cfgscale,
        width: suiParams.width,
        height: suiParams.height,
        sampler: suiParams.sampler,
        scheduler: suiParams.scheduler,
        model: suiParams.model,
        modelFile: suiModels[0]?.name,
        date: suiExtra.date,
        timestamp: suiExtra.date ? new Date(suiExtra.date) : (metaParams.timestamp ? new Date(metaParams.timestamp) : new Date()),
        // fallback to metaParams.timestamp or now
      };
    });
  }, []);

  // New function: fetch image and create thumbnail in one step
  const fetchAndCreateThumbnail = useCallback(async (filename: string, id: string): Promise<string | undefined> => {
    const imageData = await apiService.fetchImage(filename, sessionId || undefined);
    if (!imageData) return undefined;
    try {
      return await createAndStoreThumbnail(imageData, id);
    } catch (e) {
      console.warn('Failed to create thumbnail:', e);
      return undefined;
    }
  }, [sessionId]);

  const fetchImages = useCallback(async () => {
    if (hasLoaded) return; // Don't fetch again if already loaded
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.listImages("", 3, "Name", false, sessionId || undefined);
      setAllImageFiles(response.files);
      const firstPageFiles = response.files.slice(0, ITEMS_PER_PAGE);
      const imageObjects = processImageFiles(firstPageFiles);
      // Create thumbnails for the first page
      const imagesWithThumbnails = await Promise.all(
        imageObjects.map(async (image) => {
          const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id);
          return {
            ...image,
            imageData: undefined,
            thumbnailUri,
          };
        })
      );
      setImages(imagesWithThumbnails);
      setCurrentPage(0);
      setHasMore(response.files.length > ITEMS_PER_PAGE);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, processImageFiles, sessionId, fetchAndCreateThumbnail]);

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const nextPageFiles = allImageFiles.slice(startIndex, endIndex);
      if (nextPageFiles.length === 0) {
        setHasMore(false);
        return;
      }
      const imageObjects = processImageFiles(nextPageFiles);
      // Create thumbnails for the new page
      const imagesWithThumbnails = await Promise.all(
        imageObjects.map(async (image) => {
          const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id);
          return {
            ...image,
            imageData: undefined,
            thumbnailUri,
          };
        })
      );
      setImages(prev => [...prev, ...imagesWithThumbnails]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < allImageFiles.length);
    } catch (err) {
      console.error('Failed to load more images:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, allImageFiles, processImageFiles, fetchAndCreateThumbnail]);

  const addImage = useCallback((imageUrl: string, prompt: string) => {
    const newImage: HistoryImage = {
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
      timestamp: new Date(),
      filename: '',
    };
    
    setImages(prev => [newImage, ...prev]);
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const clearHistory = useCallback(() => {
    setImages([]);
    setAllImageFiles([]);
    setCurrentPage(0);
    setHasMore(true);
    setHasLoaded(false);
    fetchImages(); // Immediately reload from the server
  }, [fetchImages]);

  const getImageById = useCallback((imageId: string) => {
    return images.find(img => img.id === imageId);
  }, [images]);

  const refreshImages = useCallback(() => {
    setHasLoaded(false);
    fetchImages();
  }, [fetchImages]);

  const refreshImage = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.filename) return;

    const imageData = await fetchImageData(image.filename);
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, imageData: imageData || undefined }
        : img
    ));
  }, [images, fetchImageData]);

  // Load imageData for a specific image (for memory optimization)
  const loadImageData = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || image.thumbnailUri || !image.filename) return;

    const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id);

    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, imageData: undefined, thumbnailUri }
        : img
    ));
  }, [images, fetchAndCreateThumbnail]);

  // Release imageData for a specific image (for memory optimization)
  const releaseImageData = useCallback((imageId: string) => {
    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, imageData: undefined }
        : img
    ));
  }, []);

  return {
    images,
    loading,
    error,
    loadingMore,
    hasMore,
    addImage,
    removeImage,
    clearHistory,
    getImageById,
    refreshImages,
    refreshImage,
    loadMoreImages,
    fetchImages,
    loadImageData,
    releaseImageData,
    totalCount: allImageFiles.length,
  };
};

export { HistoryImage };
