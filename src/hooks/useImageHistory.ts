import { useCallback, useState } from 'react';
import { API_CONFIG } from '../constants/config';
import { useSession } from '../contexts';
import { apiService } from '../services/api';
import { HistoryImage } from '../types/HistoryImage';
import { cleanupThumbnails, createAndStoreThumbnail } from '../utils/imageUtils';

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
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
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
    try {
      const imageData = await apiService.fetchImage(filename, sessionId || undefined);
      if (!imageData) {
        console.warn('No image data received for filename:', filename);
        return undefined;
      }
      
      // Create a safe ID for thumbnail creation
      const safeId = `${id}_${Date.now()}`;
      const thumbnailUri = await createAndStoreThumbnail(imageData, safeId);
      
      if (!thumbnailUri) {
        console.warn('Thumbnail creation returned null for filename:', filename);
        return undefined;
      }
      
      return thumbnailUri;
    } catch (e) {
      console.warn('Failed to create thumbnail for filename:', filename, 'Error:', e);
      // Don't throw the error, just return undefined so the app can continue
      return undefined;
    }
  }, [sessionId]);

  const fetchImages = useCallback(async () => {
    if (hasLoaded) return; // Don't fetch again if already loaded
    setLoading(true);
    setError(null);
    try {
      // Clean up any corrupted thumbnails first
      await cleanupThumbnails();
      
      const response = await apiService.listImages("", 3, "Name", false, sessionId || undefined);
      setAllImageFiles(response.files);
      const firstPageFiles = response.files.slice(0, ITEMS_PER_PAGE);
      const imageObjects = processImageFiles(firstPageFiles);
      
      // Set images immediately with loading states (no thumbnails yet)
      const imagesWithLoadingStates = imageObjects.map((image) => ({
        ...image,
        imageData: undefined,
        thumbnailUri: undefined, // This will trigger loading state
      }));
      setImages(imagesWithLoadingStates);
      setCurrentPage(0);
      setHasMore(response.files.length > ITEMS_PER_PAGE);
      setHasLoaded(true);
      
      // Load thumbnails sequentially to prevent timeouts
      setIsLoadingThumbnails(true);
      for (let i = 0; i < imageObjects.length; i++) {
        const image = imageObjects[i];
        try {
          const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id);
          setImages(prev => prev.map((img, index) => 
            index === i 
              ? { ...img, thumbnailUri }
              : img
          ));
          // Small delay between requests to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to load thumbnail for image ${i + 1}/${imageObjects.length}:`, error);
          // Continue with next image even if this one fails
        }
      }
      setIsLoadingThumbnails(false);
      
    } catch (err) {
      console.error('Failed to fetch images:', err);
      // Don't show timeout or network errors to the user
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('network')) {
          console.log('Network/timeout error occurred, not showing to user');
          // Don't set error state for timeout/network issues
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to fetch images');
      }
    } finally {
      setLoading(false);
      setIsLoadingThumbnails(false);
    }
  }, [hasLoaded, processImageFiles, sessionId, fetchAndCreateThumbnail]);

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore || isLoadingThumbnails) return; // Don't load more if still loading thumbnails
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
      
      // Add images immediately with loading states
      const imagesWithLoadingStates = imageObjects.map((image) => ({
        ...image,
        imageData: undefined,
        thumbnailUri: undefined, // This will trigger loading state
      }));
      setImages(prev => [...prev, ...imagesWithLoadingStates]);
      setCurrentPage(nextPage);
      setHasMore(endIndex < allImageFiles.length);
      
      // Load thumbnails sequentially to prevent timeouts
      setIsLoadingThumbnails(true);
      const currentImagesLength = (nextPage * ITEMS_PER_PAGE);
      for (let i = 0; i < imageObjects.length; i++) {
        const image = imageObjects[i];
        try {
          const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id);
          setImages(prev => prev.map((img, index) => 
            index === (currentImagesLength + i)
              ? { ...img, thumbnailUri }
              : img
          ));
          // Small delay between requests to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to load thumbnail for image ${i + 1}/${imageObjects.length}:`, error);
          // Continue with next image even if this one fails
        }
      }
      setIsLoadingThumbnails(false);
      
    } catch (err) {
      console.error('Failed to load more images:', err);
      // Don't show timeout or network errors to the user - just log them
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('network')) {
          console.log('Network/timeout error occurred while loading more images, not showing to user');
        }
      }
    } finally {
      setLoadingMore(false);
      setIsLoadingThumbnails(false);
    }
  }, [loadingMore, hasMore, currentPage, allImageFiles, processImageFiles, fetchAndCreateThumbnail, isLoadingThumbnails]);

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
    isLoadingThumbnails,
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
    loadedThumbnailCount: images.filter(img => img.thumbnailUri).length,
  };
};

export { HistoryImage };

