import * as FileSystem from 'expo-file-system';
import { useCallback, useRef, useState } from 'react';
import { API_CONFIG } from '../constants/config';
import { useSession } from '../contexts';
import { apiService } from '../services/api';
import { HistoryImage } from '../types/HistoryImage';
import { cleanupThumbnails, createAndStoreThumbnail } from '../utils/imageUtils';
import {
  cleanupOrphanedMetadata,
  clearAllThumbnails,
  debugCachedImagesMetadata,
  debugImageArray,
  forceRefreshMetadata,
  generateCachedImageId,
  listAllThumbnails,
  loadCachedImagesMetadata,
  metadataToHistoryImage,
  removeDuplicateImages,
  sortImagesByDate
} from '../utils/storage';

// Helper to strip leading "raw/" if present
function stripRawPrefix(path: string) {
  return path.startsWith('raw/') ? path.slice(4) : path;
}

// Utility function to detect video files
function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.webm', '.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'];
  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return videoExtensions.includes(fileExtension);
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
  
  // Queue management for thumbnail loading
  const thumbnailQueue = useRef<{filename: string; id: string; index: number; imageMetadata?: HistoryImage}[]>([]);
  const isProcessingQueue = useRef(false);
  const abortController = useRef<AbortController | null>(null);

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
    return files
      .filter(file => {
        // Filter out video files completely
        const cleanSrc = stripRawPrefix(file.src);
        if (isVideoFile(cleanSrc)) {
          console.log(`Filtering out video file: ${cleanSrc}`);
          return false;
        }
        return true;
      })
      .map((file, index) => {
        let metaParams: any = {};
        if (file.metadata) {
          try {
            metaParams = JSON.parse(file.metadata);
          } catch (e) {
            console.warn('Failed to parse metadata for file:', file.src, e);
          }
        }
        // Flatten nested metadata
        const suiParams = metaParams.sui_image_params || {};
        const suiExtra = metaParams.sui_extra_data || {};
        const suiModels = Array.isArray(metaParams.sui_models) ? metaParams.sui_models : [];
        const cleanSrc = stripRawPrefix(file.src);
        
        // Create a consistent ID based on filename, not index
        const consistentId = cleanSrc.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        return {
          id: consistentId, // Use consistent ID based on filename
          url: API_CONFIG.SWARM_IMAGE_FETCH_URL(cleanSrc),
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
  const fetchAndCreateThumbnail = useCallback(async (filename: string, id: string, imageMetadata?: HistoryImage): Promise<string | undefined> => {
    try {
      // Skip video files - ImageManipulator cannot handle video formats
      const videoExtensions = ['.webm', '.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'];
      const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (videoExtensions.includes(fileExtension)) {
        console.log(`Skipping video file for thumbnail creation: ${filename}`);
        return undefined;
      }
      
      // Create a safe ID for thumbnail filename
      const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
      const docDir = FileSystem.documentDirectory;
      if (!docDir) {
        throw new Error('Document directory not available');
      }
      
      // Check if we already have a cached JPG thumbnail
      const thumbnailsDir = `${docDir}thumbnails`;
      const cachedThumbPath = `${thumbnailsDir}/thumb_${safeId}.jpg`;
      
      // Check if cached thumbnail exists
      const cachedThumbInfo = await FileSystem.getInfoAsync(cachedThumbPath);
      if (cachedThumbInfo.exists && cachedThumbInfo.size > 0) {
        return cachedThumbPath;
      }
      
      const imageData = await apiService.fetchImage(filename, sessionId || undefined);
      if (!imageData) {
        console.warn('No image data received for filename:', filename);
        return undefined;
      }
      
      // Create and store JPG thumbnail with metadata
      const thumbnailUri = await createAndStoreThumbnail(imageData, safeId, imageMetadata);
      
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

  // Process thumbnail queue one by one - no artificial delays
  const processThumbnailQueue = useCallback(async () => {
    if (isProcessingQueue.current || thumbnailQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    
    while (thumbnailQueue.current.length > 0) {
      // Check if we should abort
      if (abortController.current?.signal.aborted) {
        console.log('Thumbnail loading aborted');
        break;
      }

      const item = thumbnailQueue.current.shift();
      if (!item) break;

      try {
        const thumbnailUri = await fetchAndCreateThumbnail(item.filename, item.id, item.imageMetadata);
        
        if (thumbnailUri) {
          // Success - set the thumbnail URI
          setImages(prev => prev.map((img, index) => 
            index === item.index 
              ? { ...img, thumbnailUri, thumbnailFailed: false }
              : img
          ));
        } else {
          // Failed to create thumbnail - mark as failed
          console.warn(`Failed to create thumbnail for ${item.filename} - marking as failed`);
          setImages(prev => prev.map((img, index) => 
            index === item.index 
              ? { ...img, thumbnailFailed: true }
              : img
          ));
        }
        
        // No artificial delay - next image starts immediately after this one finishes
        
      } catch (error) {
        console.warn(`Failed to load thumbnail for image ${item.index + 1}:`, error);
        // Mark as failed and continue with next image
        setImages(prev => prev.map((img, index) => 
          index === item.index 
            ? { ...img, thumbnailFailed: true }
            : img
        ));
      }
    }

    isProcessingQueue.current = false;
    setIsLoadingThumbnails(false);
  }, [fetchAndCreateThumbnail]);

  // Add images to thumbnail queue
  const queueThumbnails = useCallback((imageObjects: any[], startIndex: number = 0) => {
    // Cancel any existing queue processing
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    // Filter out video files and clear existing queue and add new items
    const nonVideoImages = imageObjects.filter(image => !isVideoFile(image.filename));
    
    thumbnailQueue.current = nonVideoImages.map((image, i) => ({
      filename: image.filename,
      id: image.id,
      index: startIndex + i,
      imageMetadata: image // Pass the full image object for metadata saving
    }));

    setIsLoadingThumbnails(true);
    processThumbnailQueue();
  }, [processThumbnailQueue]);

  const fetchImages = useCallback(async () => {
    if (hasLoaded) return; // Don't fetch again if already loaded
    
    // Strategy: Use server images when available (preserving listImages order)
    // Fall back to cached images only when offline (no session)
    // This ensures the correct order from the server is maintained
    
    setLoading(true);
    setError(null);
    try {
      // Debug: List existing thumbnails
      console.log('=== DEBUG: Listing existing thumbnails ===');
      await listAllThumbnails();
      console.log('=== END DEBUG ===');
      
      // Clean up any corrupted thumbnails first
      await cleanupThumbnails();
      
      // Clean up orphaned metadata entries
      await cleanupOrphanedMetadata();
      
      // Always load cached images first (both online and offline mode)
      console.log('Loading cached images...');
      const docDir = FileSystem.documentDirectory;
      if (docDir) {
        const thumbnailsDir = `${docDir}thumbnails`;
        const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
        
        if (dirInfo.exists) {
          // Get all cached thumbnail files
          const thumbnailFiles = await FileSystem.readDirectoryAsync(thumbnailsDir);
          const jpgThumbnails = thumbnailFiles.filter(file => file.endsWith('.jpg'));
          
          console.log(`Found ${jpgThumbnails.length} cached thumbnails`);
          
          // Load cached image metadata
          const cachedMetadata = await loadCachedImagesMetadata();
          console.log(`Loaded metadata for ${Object.keys(cachedMetadata).length} cached images`);
          
          // Debug: Log metadata details
          await debugCachedImagesMetadata();
          
          // Create image objects from cached thumbnails with metadata
          const cachedImages = jpgThumbnails
            .map((thumbnailFile, index) => {
              // Extract filename from thumbnail name (remove 'thumb_' prefix and '.jpg' suffix)
              const filename = thumbnailFile.replace(/^thumb_/, '').replace(/\.jpg$/, '');
              const thumbnailUri = `file://${thumbnailsDir}/${thumbnailFile}`;
              
              // Try to find metadata for this image by matching the safe ID
              const safeId = filename; // The filename is the safe ID
              let metadata = null;
              
              console.log(`Looking for metadata for thumbnail: ${filename}`);
              
              // First try to find metadata by the safe ID directly
              if (cachedMetadata[safeId]) {
                metadata = cachedMetadata[safeId];
                console.log(`Found metadata by direct ID match: ${safeId}`);
              } else {
                // If not found, try to find by matching the original ID pattern
                // Look for metadata entries that might match this thumbnail
                for (const [metadataId, meta] of Object.entries(cachedMetadata)) {
                  // Try multiple matching strategies
                  const metadataSafeId = metadataId.replace(/[^a-zA-Z0-9-_]/g, '_');
                  const filenameSafeId = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
                  
                  if (metadataSafeId === safeId || 
                      metadataSafeId === filenameSafeId || 
                      metadataId.includes(filename) ||
                      meta.filename === filename) {
                    metadata = meta;
                    console.log(`Found metadata by pattern match: ${metadataId} -> ${filename}`);
                    break;
                  }
                }
              }
              
              if (metadata) {
                // Use saved metadata to restore full image properties
                console.log(`Using metadata for ${filename}: prompt="${metadata.prompt}", timestamp=${metadata.timestamp}`);
                return metadataToHistoryImage(metadata, thumbnailUri);
              } else {
                // Fallback for images without metadata (legacy cached images)
                console.log(`No metadata found for ${filename}, using fallback`);
                const fallbackId = generateCachedImageId(filename);
                return {
                  id: fallbackId,
                  url: thumbnailUri,
                  filename: filename,
                  prompt: 'Cached image',
                  negativePrompt: '',
                  steps: 0,
                  seed: 0,
                  cfgscale: 0,
                  width: 0,
                  height: 0,
                  sampler: '',
                  scheduler: '',
                  model: '',
                  modelFile: '',
                  date: new Date().toISOString(),
                  timestamp: new Date(),
                  thumbnailUri,
                  thumbnailFailed: false,
                  imageData: undefined,
                };
              }
            })
            .filter(image => {
              // Filter out video files from cached images
              if (isVideoFile(image.filename)) {
                console.log(`Filtering out cached video file: ${image.filename}`);
                return false;
              }
              return true;
            });
          
          // Remove duplicates and sort cached images by generation date (newest first)
          const uniqueCachedImages = removeDuplicateImages(cachedImages);
          const sortedCachedImages = sortImagesByDate(uniqueCachedImages);
          
          // Debug the cached images
          debugImageArray(cachedImages, 'Before deduplication');
          debugImageArray(uniqueCachedImages, 'After deduplication');
          debugImageArray(sortedCachedImages, 'After sorting');
          
          console.log(`Processed ${cachedImages.length} cached images, removed ${cachedImages.length - uniqueCachedImages.length} duplicates, sorted ${sortedCachedImages.length} unique images by date`);
          if (sortedCachedImages.length > 0) {
            const oldest = sortedCachedImages[sortedCachedImages.length - 1].timestamp;
            const newest = sortedCachedImages[0].timestamp;
            console.log(`Cached images date range: ${oldest.toISOString()} to ${newest.toISOString()}`);
          }
          
          setImages(sortedCachedImages);
        } else {
          setImages([]);
        }
      } else {
        setImages([]);
      }
      
      // If we have a session, fetch server images but don't load them yet
      if (sessionId) {
        console.log('Online mode: fetching image list from server...');
        const response = await apiService.listImages("", 3, "Name", false, sessionId || undefined);
        console.log(`Received ${response.files.length} files from server`);
        
        // Print detailed response information for refresh
        console.log('=== listImages Response Details (Refresh) ===');
        console.log('Response structure:', JSON.stringify(response, null, 2));
        console.log(`Folders count: ${response.folders?.length || 0}`);
        if (response.folders && response.folders.length > 0) {
          console.log('Folders:', response.folders);
        }
        console.log(`Files count: ${response.files?.length || 0}`);
        if (response.files && response.files.length > 0) {
          console.log('First 5 files:');
          response.files.slice(0, 5).forEach((file, index) => {
            console.log(`  ${index + 1}. src: ${file.src}, metadata: ${file.metadata || 'none'}`);
          });
          if (response.files.length > 5) {
            console.log(`  ... and ${response.files.length - 5} more files`);
          }
        }
        console.log('=== End listImages Response Details (Refresh) ===');
        
        setAllImageFiles(response.files);
        
        // Load the first page of server images automatically
        if (response.files.length > 0) {
          console.log('Loading first page of server images automatically...');
          const firstPageFiles = response.files.slice(0, ITEMS_PER_PAGE);
          const imageObjects = processImageFiles(firstPageFiles);
          
          // Debug server images
          debugImageArray(imageObjects, 'Server images before combining');
          
          // When we have server images, use only those to preserve the exact order from listImages
          // Don't combine with cached images as this messes up the server order
          const imagesWithLoadingStates = imageObjects.map((image) => ({
            ...image,
            imageData: undefined,
            thumbnailUri: undefined, // This will trigger loading state
          }));
          
          // Debug server images
          debugImageArray(imagesWithLoadingStates, 'Server images (preserving order)');
          
          console.log(`Using ${imagesWithLoadingStates.length} server images in original order from listImages response`);
          
          // Queue thumbnails for loading one by one
          queueThumbnails(imageObjects, 0);
          setImages(imagesWithLoadingStates);
          setCurrentPage(0);
          setHasMore(response.files.length > ITEMS_PER_PAGE); // Enable load more button if there are more images
        } else {
          setHasMore(false);
        }
      } else {
        setAllImageFiles([]);
        setHasMore(false);
      }
      
      setCurrentPage(0);
      setHasLoaded(true);
      
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
    }
  }, [hasLoaded, sessionId, processImageFiles, queueThumbnails]);

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore || isLoadingThumbnails) return; // Don't load more if still loading thumbnails
    setLoadingMore(true);
    try {
      // If we haven't loaded any server images yet, start from the first page
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
      setImages(prev => {
        const newImages = [...prev, ...imagesWithLoadingStates];
        // Preserve server order - don't remove duplicates or re-sort
        // The server images come in the correct order from listImages
        return newImages;
      });
      setCurrentPage(nextPage);
      setHasMore(endIndex < allImageFiles.length);
      
      // Queue thumbnails for loading one by one
      queueThumbnails(imageObjects, startIndex);
      
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
    }
  }, [loadingMore, hasMore, currentPage, allImageFiles, processImageFiles, queueThumbnails, isLoadingThumbnails]);

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

  const clearHistory = useCallback(async () => {
    try {
      // Abort any ongoing thumbnail loading
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Clear all thumbnails from device storage
      await clearAllThumbnails();
      console.log('All thumbnails cleared from device storage');
    } catch (error) {
      console.error('Failed to clear thumbnails:', error);
      // Continue with clearing history even if thumbnail clearing fails
    }
    
    // Clear the in-memory state
    setImages([]);
    setAllImageFiles([]);
    setCurrentPage(0);
    setHasMore(true);
    setHasLoaded(false);
    thumbnailQueue.current = [];
    isProcessingQueue.current = false;
    setIsLoadingThumbnails(false);
    fetchImages(); // Immediately reload from the server
  }, [fetchImages]);

  const getImageById = useCallback((imageId: string) => {
    return images.find(img => img.id === imageId);
  }, [images]);

  const refreshImages = useCallback(async () => {
    console.log('refreshImages called - starting refresh...');
    
    // Abort any ongoing thumbnail loading
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Cleaning up thumbnails...');
      // Clean up any corrupted thumbnails first
      await cleanupThumbnails();
      
      // Clean up orphaned metadata entries
      await cleanupOrphanedMetadata();
      
      // Always load cached images first (both online and offline mode)
      console.log('Loading cached images...');
      const docDir = FileSystem.documentDirectory;
      if (docDir) {
        const thumbnailsDir = `${docDir}thumbnails`;
        const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
        
        if (dirInfo.exists) {
          // Get all cached thumbnail files
          const thumbnailFiles = await FileSystem.readDirectoryAsync(thumbnailsDir);
          const jpgThumbnails = thumbnailFiles.filter(file => file.endsWith('.jpg'));
          
          console.log(`Found ${jpgThumbnails.length} cached thumbnails`);
          
          // Load cached image metadata
          const cachedMetadata = await loadCachedImagesMetadata();
          console.log(`Loaded metadata for ${Object.keys(cachedMetadata).length} cached images`);
          
          // Debug: Log metadata details
          await debugCachedImagesMetadata();
          
          // Create image objects from cached thumbnails with metadata
          const cachedImages = jpgThumbnails
            .map((thumbnailFile, index) => {
              // Extract filename from thumbnail name (remove 'thumb_' prefix and '.jpg' suffix)
              const filename = thumbnailFile.replace(/^thumb_/, '').replace(/\.jpg$/, '');
              const thumbnailUri = `file://${thumbnailsDir}/${thumbnailFile}`;
              
              // Try to find metadata for this image by matching the safe ID
              const safeId = filename; // The filename is the safe ID
              let metadata = null;
              
              console.log(`Looking for metadata for thumbnail: ${filename}`);
              
              // First try to find metadata by the safe ID directly
              if (cachedMetadata[safeId]) {
                metadata = cachedMetadata[safeId];
                console.log(`Found metadata by direct ID match: ${safeId}`);
              } else {
                // If not found, try to find by matching the original ID pattern
                // Look for metadata entries that might match this thumbnail
                for (const [metadataId, meta] of Object.entries(cachedMetadata)) {
                  // Try multiple matching strategies
                  const metadataSafeId = metadataId.replace(/[^a-zA-Z0-9-_]/g, '_');
                  const filenameSafeId = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
                  
                  if (metadataSafeId === safeId || 
                      metadataSafeId === filenameSafeId || 
                      metadataId.includes(filename) ||
                      meta.filename === filename) {
                    metadata = meta;
                    console.log(`Found metadata by pattern match: ${metadataId} -> ${filename}`);
                    break;
                  }
                }
              }
              
              if (metadata) {
                // Use saved metadata to restore full image properties
                console.log(`Using metadata for ${filename}: prompt="${metadata.prompt}", timestamp=${metadata.timestamp}`);
                return metadataToHistoryImage(metadata, thumbnailUri);
              } else {
                // Fallback for images without metadata (legacy cached images)
                console.log(`No metadata found for ${filename}, using fallback`);
                const fallbackId = generateCachedImageId(filename);
                return {
                  id: fallbackId,
                  url: thumbnailUri,
                  filename: filename,
                  prompt: 'Cached image',
                  negativePrompt: '',
                  steps: 0,
                  seed: 0,
                  cfgscale: 0,
                  width: 0,
                  height: 0,
                  sampler: '',
                  scheduler: '',
                  model: '',
                  modelFile: '',
                  date: new Date().toISOString(),
                  timestamp: new Date(),
                  thumbnailUri,
                  thumbnailFailed: false,
                  imageData: undefined,
                };
              }
            })
            .filter(image => {
              // Filter out video files from cached images
              if (isVideoFile(image.filename)) {
                console.log(`Filtering out cached video file: ${image.filename}`);
                return false;
              }
              return true;
            });
          
          // Remove duplicates and sort cached images by generation date (newest first)
          const uniqueCachedImages = removeDuplicateImages(cachedImages);
          const sortedCachedImages = sortImagesByDate(uniqueCachedImages);
          
          // Debug the cached images
          debugImageArray(cachedImages, 'Before deduplication');
          debugImageArray(uniqueCachedImages, 'After deduplication');
          debugImageArray(sortedCachedImages, 'After sorting');
          
          console.log(`Processed ${cachedImages.length} cached images, removed ${cachedImages.length - uniqueCachedImages.length} duplicates, sorted ${sortedCachedImages.length} unique images by date`);
          if (sortedCachedImages.length > 0) {
            const oldest = sortedCachedImages[sortedCachedImages.length - 1].timestamp;
            const newest = sortedCachedImages[0].timestamp;
            console.log(`Cached images date range: ${oldest.toISOString()} to ${newest.toISOString()}`);
          }
          
          setImages(sortedCachedImages);
        } else {
          setImages([]);
        }
      } else {
        setImages([]);
      }
      
      // If we have a session, fetch server images but don't load them yet
      if (sessionId) {
        console.log('Online mode: fetching image list from server...');
        const response = await apiService.listImages("", 3, "Name", false, sessionId || undefined);
        console.log(`Received ${response.files.length} files from server`);
        setAllImageFiles(response.files);
        
        // Load the first page of server images automatically
        if (response.files.length > 0) {
          console.log('Loading first page of server images automatically...');
          const firstPageFiles = response.files.slice(0, ITEMS_PER_PAGE);
          const imageObjects = processImageFiles(firstPageFiles);
          
          // Debug server images
          debugImageArray(imageObjects, 'Server images before combining');
          
          // When we have server images, use only those to preserve the exact order from listImages
          // Don't combine with cached images as this messes up the server order
          const imagesWithLoadingStates = imageObjects.map((image) => ({
            ...image,
            imageData: undefined,
            thumbnailUri: undefined, // This will trigger loading state
          }));
          
          // Debug server images
          debugImageArray(imagesWithLoadingStates, 'Server images (preserving order)');
          
          console.log(`Using ${imagesWithLoadingStates.length} server images in original order from listImages response`);
          
          // Queue thumbnails for loading one by one
          queueThumbnails(imageObjects, 0);
          setImages(imagesWithLoadingStates);
          setCurrentPage(0);
          setHasMore(response.files.length > ITEMS_PER_PAGE); // Enable load more button if there are more images
        } else {
          setHasMore(false);
        }
      } else {
        setAllImageFiles([]);
        setHasMore(false);
      }
      
      setCurrentPage(0);
      setHasLoaded(true);
      
      console.log('Refresh completed successfully');
      
    } catch (err) {
      console.error('Failed to refresh images:', err);
      // Don't show timeout or network errors to the user
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('network')) {
          console.log('Network/timeout error occurred, not showing to user');
          // Don't set error state for timeout/network issues
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to refresh images');
      }
    } finally {
      setLoading(false);
      console.log('Refresh loading state set to false');
    }
  }, [sessionId, processImageFiles, queueThumbnails]);

  const refreshImage = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.filename) return;

    // Fetch fresh image data and recreate thumbnail
    const imageData = await fetchImageData(image.filename);
    const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id, image);

    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { 
            ...img, 
            imageData: imageData || undefined,
            thumbnailUri: thumbnailUri || undefined,
            thumbnailFailed: !thumbnailUri
          }
        : img
    ));
  }, [images, fetchImageData, fetchAndCreateThumbnail]);

  // Load imageData for a specific image (for memory optimization)
  const loadImageData = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || image.thumbnailUri || image.thumbnailFailed || !image.filename) return;

    const thumbnailUri = await fetchAndCreateThumbnail(image.filename, image.id, image);

    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, imageData: undefined, thumbnailUri: thumbnailUri || undefined, thumbnailFailed: !thumbnailUri }
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

  const forceRefreshMetadataAndReload = useCallback(async () => {
    try {
      console.log('Force refreshing metadata and reloading images...');
      await forceRefreshMetadata();
      await cleanupOrphanedMetadata();
      setHasLoaded(false); // Reset loaded state to force reload
      await fetchImages();
    } catch (error) {
      console.error('Failed to force refresh metadata:', error);
    }
  }, [fetchImages]);

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
    forceRefreshMetadataAndReload,
    totalCount: allImageFiles.length,
    loadedThumbnailCount: images.filter(img => img.thumbnailUri && !img.thumbnailFailed).length,
  };
};

export { HistoryImage };

