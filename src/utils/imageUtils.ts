import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';
import { THUMBNAIL_CONFIG } from '../constants/config';
import { HistoryImage } from '../types/HistoryImage';
import { historyImageToMetadata, saveCachedImageMetadata } from './storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function calculateImageDimensions(screenHeight: number) {
  const maxImageHeight = screenHeight * 0.6
  const maxImageWidth = 400
  const aspectRatio = 2 / 3 // 2:3 aspect ratio

  let finalImageHeight = maxImageHeight
  let finalImageWidth = finalImageHeight * aspectRatio

  if (finalImageWidth > maxImageWidth) {
    finalImageWidth = maxImageWidth
    finalImageHeight = finalImageWidth / aspectRatio
  }

  const imageAreaHeight = finalImageHeight + 40 // Add some padding

  return {
    finalImageWidth,
    finalImageHeight,
    imageAreaHeight,
  }
}

// Helper to convert image URL to base64
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is not available in all JS environments, so use Buffer if needed
  // @ts-ignore
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

/**
 * Cleans up corrupted or invalid thumbnails
 */
export async function cleanupThumbnails(): Promise<void> {
  try {
    const docDir = FileSystem.documentDirectory;
    if (!docDir) return;
    
    const thumbnailsDir = `${docDir}thumbnails`;
    
    // Check if thumbnails directory exists
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
    if (!dirInfo.exists) {
      console.log('Thumbnails directory does not exist, nothing to cleanup');
      return;
    }
    
    // List all files in thumbnails directory
    const files = await FileSystem.readDirectoryAsync(thumbnailsDir);
    console.log(`Found ${files.length} files in thumbnails directory`);
    
    // Check each file and remove corrupted ones (only JPG files)
    let cleanedCount = 0;
    for (const file of files) {
      if (file.endsWith('.jpg')) {
        const filePath = `${thumbnailsDir}/${file}`;
        try {
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists && fileInfo.size === 0) {
            // Remove empty files
            await FileSystem.deleteAsync(filePath);
            console.log('Removed empty JPG thumbnail:', file);
            cleanedCount++;
          }
        } catch (error) {
          // Remove files that can't be accessed
          await FileSystem.deleteAsync(filePath).catch(() => {});
          console.log('Removed corrupted JPG thumbnail:', file);
          cleanedCount++;
        }
      } else {
        console.log(`Skipping non-JPG file: ${file}`);
      }
    }
    
    console.log(`Cleanup completed: ${cleanedCount} files removed`);
  } catch (error) {
    console.warn('Failed to cleanup thumbnails:', error);
  }
}

/**
 * Creates a thumbnail from a base64 image and stores it on device.
 * The thumbnail maintains the original aspect ratio and fits within a square.
 * @param imageData The base64 string of the image (data:image/png;base64,...) or URL
 * @param safeId Unique safe id for the image (used for filename)
 * @param imageMetadata Optional metadata to save alongside the thumbnail
 * @returns The local URI of the stored thumbnail
 */
export async function createAndStoreThumbnail(
  imageData: string, 
  safeId: string, 
  imageMetadata?: HistoryImage
): Promise<string> {
  let tempPath: string | null = null;
  let thumbPath: string | null = null;
  
  try {
    // Validate input
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }
    
    let base64 = imageData;
    let isJpg = false;
    
    // Check if the input is already JPG format
    if (base64.startsWith('data:')) {
      const mimeType = base64.match(/^data:([^;]+);/)?.[1];
      isJpg = mimeType === 'image/jpeg' || mimeType === 'image/jpg';
      base64 = base64.replace(/^data:[^;]+;base64,/, '');
    }
    if (base64.startsWith('http')) {
      base64 = await urlToBase64(base64);
    }

    // Validate base64 data
    if (!base64 || base64.length === 0) {
      throw new Error('Empty base64 data after processing');
    }

    // Ensure we have valid directories
    const cacheDir = FileSystem.cacheDirectory;
    const docDir = FileSystem.documentDirectory;
    
    if (!cacheDir || !docDir) {
      throw new Error('File system directories not available');
    }
    
    // Write the base64 image to a temporary file
    tempPath = `${cacheDir}temp_${safeId}.jpg`;
    
    // Ensure the cache directory exists
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(() => {});
    
    await FileSystem.writeAsStringAsync(tempPath, base64, { encoding: FileSystem.EncodingType.Base64 });
    
    // Verify the temp file was created and wait a moment for file system sync
    const tempFileInfo = await FileSystem.getInfoAsync(tempPath);
    if (!tempFileInfo.exists || tempFileInfo.size === 0) {
      throw new Error('Failed to create temporary image file');
    }
    
    // Small delay to ensure file system has synced
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // If the input was already JPG, we can skip the first conversion step
    let manipResult;
    if (isJpg) {
      // Just get dimensions and resize directly
      const originalImage = await ImageManipulator.manipulateAsync(
        tempPath,
        [], // No operations, just get info
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Calculate the resize dimensions to fit within the square while maintaining aspect ratio
      const maxSize = THUMBNAIL_CONFIG.SIZE;
      const aspectRatio = originalImage.width / originalImage.height;
      
      let resizeWidth, resizeHeight;
      if (aspectRatio > 1) {
        // Landscape image
        resizeWidth = maxSize;
        resizeHeight = maxSize / aspectRatio;
      } else {
        // Portrait or square image
        resizeWidth = maxSize * aspectRatio;
        resizeHeight = maxSize;
      }
      
      // Resize the image to fit within the square
      manipResult = await ImageManipulator.manipulateAsync(
        tempPath,
        [{ 
          resize: { 
            width: Math.round(resizeWidth), 
            height: Math.round(resizeHeight) 
          } 
        }],
        { 
          compress: THUMBNAIL_CONFIG.COMPRESSION, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
    } else {
      // Original logic for PNG to JPG conversion
      const originalImage = await ImageManipulator.manipulateAsync(
        tempPath,
        [], // No operations, just get info and convert to JPG
        { 
          format: ImageManipulator.SaveFormat.JPEG,
          compress: THUMBNAIL_CONFIG.COMPRESSION
        }
      );
      
      // Calculate the resize dimensions to fit within the square while maintaining aspect ratio
      const maxSize = THUMBNAIL_CONFIG.SIZE;
      const aspectRatio = originalImage.width / originalImage.height;
      
      let resizeWidth, resizeHeight;
      if (aspectRatio > 1) {
        // Landscape image
        resizeWidth = maxSize;
        resizeHeight = maxSize / aspectRatio;
      } else {
        // Portrait or square image
        resizeWidth = maxSize * aspectRatio;
        resizeHeight = maxSize;
      }
      
      // Resize the image to fit within the square and ensure JPG format
      manipResult = await ImageManipulator.manipulateAsync(
        tempPath,
        [{ 
          resize: { 
            width: Math.round(resizeWidth), 
            height: Math.round(resizeHeight) 
          } 
        }],
        { 
          compress: THUMBNAIL_CONFIG.COMPRESSION, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
    }
    
    // Verify the manipulated result
    if (!manipResult.uri) {
      throw new Error('Image manipulation failed - no result URI');
    }
    
    // Create thumbnails directory in documents
    const thumbnailsDir = `${docDir}thumbnails`;
    await FileSystem.makeDirectoryAsync(thumbnailsDir, { intermediates: true }).catch(() => {});
    
    // Save the thumbnail to a permanent location with safe filename (always as JPG)
    thumbPath = `${thumbnailsDir}/thumb_${safeId}.jpg`;
    
    // Use moveAsync instead of copyAsync for better reliability
    await FileSystem.moveAsync({ from: manipResult.uri, to: thumbPath });
    
    // Verify the thumbnail was created
    const thumbFileInfo = await FileSystem.getInfoAsync(thumbPath);
    if (!thumbFileInfo.exists || thumbFileInfo.size === 0) {
      throw new Error('Failed to create thumbnail file');
    }
    
    // Save metadata if provided
    if (imageMetadata) {
      try {
        const metadata = historyImageToMetadata(imageMetadata);
        // Use the safeId (filename) as the metadata key for consistency
        metadata.id = safeId;
        await saveCachedImageMetadata(metadata);
        console.log('Saved metadata for cached image:', safeId);
      } catch (metadataError) {
        console.warn('Failed to save image metadata, but thumbnail was created successfully:', metadataError);
        // Don't fail the entire operation if metadata saving fails
      }
    }
    
    return thumbPath;
  } catch (error) {
    // Log the error but don't throw it if it's a non-critical file system error
    if (error instanceof Error && (
      error.message.includes("The file") && error.message.includes("couldn't be opened") ||
      error.message.includes("file is not readable") ||
      error.message.includes("Error decoding image data")
    )) {
      console.warn('Non-critical file system error during thumbnail creation:', error.message);
      // If we have a thumbnail path, try to return it even if there were non-critical errors
      if (thumbPath) {
        const thumbFileInfo = await FileSystem.getInfoAsync(thumbPath);
        if (thumbFileInfo.exists && thumbFileInfo.size > 0) {
          console.log('Thumbnail was created successfully despite non-critical error, returning path');
          return thumbPath;
        }
      }
      // If no thumbnail path or file doesn't exist, return empty string
      return '';
    }
    
    console.warn('Failed to create thumbnail:', error);
    throw error;
  } finally {
    // Clean up temp file if it exists
    if (tempPath) {
      await FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => {});
    }
  }
} 