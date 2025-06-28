import * as FileSystem from 'expo-file-system'
import { HistoryImage } from '../types/HistoryImage'

interface UserSettings {
  prompt?: string
  sampler?: string
  scheduler?: string
  steps?: number
  cfgScale?: number
  images?: number
  seed?: number
  aspectRatio?: string
  width?: number
  height?: number
  showCoreParams?: boolean
  showSampling?: boolean
  showResolution?: boolean
  showSidePanel?: boolean
}

// Interface for cached image metadata
export interface CachedImageMetadata {
  id: string
  filename: string
  prompt: string
  negativePrompt?: string
  steps?: number
  seed?: number
  cfgscale?: number
  width?: number
  height?: number
  sampler?: string
  scheduler?: string
  model?: string
  modelFile?: string
  date?: string
  timestamp: string // ISO string
  url?: string
}

const SETTINGS_KEY = 'user_settings.json'
const CACHED_IMAGES_KEY = 'cached_images.json'

const getStoragePath = (): string => {
  const docDir = FileSystem.documentDirectory
  if (!docDir) {
    throw new Error('Document directory not available')
  }
  return `${docDir}${SETTINGS_KEY}`
}

const getCachedImagesPath = (): string => {
  const docDir = FileSystem.documentDirectory
  if (!docDir) {
    throw new Error('Document directory not available')
  }
  return `${docDir}${CACHED_IMAGES_KEY}`
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    const existingSettings = await loadUserSettings()
    const updatedSettings = { ...existingSettings, ...settings }
    const storagePath = getStoragePath()
    await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(updatedSettings))
  } catch (error) {
    console.error('Failed to save user settings:', error)
    throw error
  }
}

export async function loadUserSettings(): Promise<UserSettings> {
  try {
    const storagePath = getStoragePath()
    const fileInfo = await FileSystem.getInfoAsync(storagePath)
    if (fileInfo.exists) {
      const settingsJson = await FileSystem.readAsStringAsync(storagePath)
      return JSON.parse(settingsJson)
    }
    return {}
  } catch (error) {
    console.error('Failed to load user settings:', error)
    return {}
  }
}

export async function clearUserSettings(): Promise<void> {
  try {
    const storagePath = getStoragePath()
    await FileSystem.deleteAsync(storagePath, { idempotent: true })
  } catch (error) {
    console.error('Failed to clear user settings:', error)
    throw error
  }
}

// New functions for cached image metadata
export async function saveCachedImageMetadata(metadata: CachedImageMetadata): Promise<void> {
  try {
    const existingMetadata = await loadCachedImagesMetadata()
    const updatedMetadata = { ...existingMetadata, [metadata.id]: metadata }
    const storagePath = getCachedImagesPath()
    await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(updatedMetadata))
  } catch (error) {
    console.error('Failed to save cached image metadata:', error)
    throw error
  }
}

export async function loadCachedImagesMetadata(): Promise<Record<string, CachedImageMetadata>> {
  try {
    const storagePath = getCachedImagesPath()
    const fileInfo = await FileSystem.getInfoAsync(storagePath)
    if (fileInfo.exists) {
      const metadataJson = await FileSystem.readAsStringAsync(storagePath)
      return JSON.parse(metadataJson)
    }
    return {}
  } catch (error) {
    console.error('Failed to load cached images metadata:', error)
    return {}
  }
}

export async function removeCachedImageMetadata(imageId: string): Promise<void> {
  try {
    const existingMetadata = await loadCachedImagesMetadata()
    const { [imageId]: removed, ...remainingMetadata } = existingMetadata
    const storagePath = getCachedImagesPath()
    await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(remainingMetadata))
  } catch (error) {
    console.error('Failed to remove cached image metadata:', error)
    throw error
  }
}

export async function clearCachedImagesMetadata(): Promise<void> {
  try {
    const storagePath = getCachedImagesPath()
    await FileSystem.deleteAsync(storagePath, { idempotent: true })
  } catch (error) {
    console.error('Failed to clear cached images metadata:', error)
    throw error
  }
}

// Debug function to inspect cached image metadata
export async function debugCachedImagesMetadata(): Promise<void> {
  try {
    const metadata = await loadCachedImagesMetadata()
    console.log('=== Cached Images Metadata Debug ===')
    console.log(`Total cached images: ${Object.keys(metadata).length}`)
    
    // Convert to array and sort by timestamp for better debugging
    const sortedMetadata = Object.entries(metadata)
      .map(([id, meta]) => ({ metadataId: id, ...meta }))
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime()
        const dateB = new Date(b.timestamp).getTime()
        return dateB - dateA // Newest first
      })
    
    for (const meta of sortedMetadata) {
      console.log(`ID: ${meta.metadataId}`)
      console.log(`  Filename: ${meta.filename}`)
      console.log(`  Prompt: ${meta.prompt}`)
      console.log(`  Model: ${meta.model || 'N/A'}`)
      console.log(`  Steps: ${meta.steps || 'N/A'}`)
      console.log(`  Seed: ${meta.seed || 'N/A'}`)
      console.log(`  Size: ${meta.width || 'N/A'}x${meta.height || 'N/A'}`)
      console.log(`  Date: ${meta.timestamp}`)
      console.log('---')
    }
    console.log('=== End Debug ===')
  } catch (error) {
    console.error('Failed to debug cached images metadata:', error)
  }
}

// Helper function to convert HistoryImage to CachedImageMetadata
export function historyImageToMetadata(image: HistoryImage): CachedImageMetadata {
  return {
    id: image.id,
    filename: image.filename,
    prompt: image.prompt,
    negativePrompt: image.negativePrompt,
    steps: image.steps,
    seed: image.seed,
    cfgscale: image.cfgscale,
    width: image.width,
    height: image.height,
    sampler: image.sampler,
    scheduler: image.scheduler,
    model: image.model,
    modelFile: image.modelFile,
    date: image.date,
    timestamp: image.timestamp.toISOString(),
    url: image.url,
  }
}

// Helper function to convert CachedImageMetadata to HistoryImage
export function metadataToHistoryImage(metadata: CachedImageMetadata, thumbnailUri: string): HistoryImage {
  return {
    id: metadata.id,
    url: metadata.url || '',
    prompt: metadata.prompt,
    timestamp: new Date(metadata.timestamp),
    filename: metadata.filename,
    model: metadata.model,
    width: metadata.width,
    height: metadata.height,
    sampler: metadata.sampler,
    scheduler: metadata.scheduler,
    steps: metadata.steps,
    cfgscale: metadata.cfgscale,
    negativePrompt: metadata.negativePrompt,
    seed: metadata.seed,
    modelFile: metadata.modelFile,
    date: metadata.date,
    thumbnailUri,
    thumbnailFailed: false,
    imageData: undefined,
  }
}

// Helper function to generate a consistent ID for cached images
export function generateCachedImageId(filename: string, originalId?: string): string {
  // If we have an original ID, use it; otherwise generate one from filename
  // Remove timestamp to ensure consistency - use only filename-based ID
  if (originalId) {
    return originalId;
  }
  // Create a safe, consistent ID from filename without timestamp
  return `cached_${filename.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
}

// Helper function to create a unique content-based ID for deduplication
export function createContentBasedId(image: HistoryImage): string {
  // Use a combination of filename and key metadata to create a unique ID
  // Normalize the values to handle undefined/null cases
  const normalizedFilename = image.filename || 'unknown';
  const normalizedPrompt = image.prompt || 'unknown';
  const normalizedSeed = image.seed?.toString() || 'unknown';
  const normalizedSteps = image.steps?.toString() || 'unknown';
  
  // Create a content hash that's more robust
  // For deduplication, we primarily care about the filename since that's the unique identifier
  // from the server, but we also include key metadata to handle edge cases
  const contentHash = `${normalizedFilename}_${normalizedPrompt}_${normalizedSeed}_${normalizedSteps}`;
  
  // Clean up the hash to make it safe for use as a key
  return contentHash
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

// Helper function to create a simpler filename-based ID for basic deduplication
export function createFilenameBasedId(image: HistoryImage): string {
  const normalizedFilename = image.filename || 'unknown';
  return normalizedFilename
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

// Helper function to detect duplicates in an array of images
export function removeDuplicateImages(images: HistoryImage[]): HistoryImage[] {
  const seenByFilename = new Map<string, HistoryImage>();
  const seenByContent = new Map<string, HistoryImage>();
  const uniqueImages: HistoryImage[] = [];
  let duplicateCount = 0;
  
  for (const image of images) {
    // Create both filename-based and content-based keys for deduplication
    const filenameKey = createFilenameBasedId(image);
    const contentKey = createContentBasedId(image);
    
    // First check for filename-based duplicates (most reliable)
    if (!seenByFilename.has(filenameKey)) {
      seenByFilename.set(filenameKey, image);
      seenByContent.set(contentKey, image);
      uniqueImages.push(image);
    } else {
      duplicateCount++;
      // If we find a duplicate by filename, keep the one with more complete metadata
      const existing = seenByFilename.get(filenameKey)!;
      const existingScore = getMetadataCompletenessScore(existing);
      const currentScore = getMetadataCompletenessScore(image);
      
      console.log(`Duplicate detected by filename for ${image.filename}: existing score=${existingScore}, current score=${currentScore}`);
      
      if (currentScore > existingScore) {
        // Replace with the more complete version
        const index = uniqueImages.indexOf(existing);
        uniqueImages[index] = image;
        seenByFilename.set(filenameKey, image);
        seenByContent.set(contentKey, image);
        console.log(`Replaced duplicate with more complete version: ${image.filename}`);
      } else {
        console.log(`Kept existing version of duplicate: ${existing.filename}`);
      }
    }
  }
  
  if (duplicateCount > 0) {
    console.log(`Removed ${duplicateCount} duplicate images, kept ${uniqueImages.length} unique images`);
  }
  
  return uniqueImages;
}

// Helper function to score metadata completeness
function getMetadataCompletenessScore(image: HistoryImage): number {
  let score = 0;
  if (image.prompt) score += 10;
  if (image.negativePrompt) score += 5;
  if (image.steps) score += 5;
  if (image.seed) score += 5;
  if (image.cfgscale) score += 5;
  if (image.width && image.height) score += 5;
  if (image.sampler) score += 3;
  if (image.scheduler) score += 3;
  if (image.model) score += 3;
  if (image.modelFile) score += 3;
  if (image.date) score += 2;
  if (image.thumbnailUri) score += 5;
  return score;
}

export async function clearAllThumbnails(): Promise<void> {
  try {
    const docDir = FileSystem.documentDirectory
    if (!docDir) {
      throw new Error('Document directory not available')
    }
    
    const thumbnailsDir = `${docDir}thumbnails`
    console.log(`Clearing thumbnails from directory: ${thumbnailsDir}`)
    
    // Check if thumbnails directory exists
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir)
    if (!dirInfo.exists) {
      console.log('Thumbnails directory does not exist, nothing to clear')
      return
    }
    
    // List all files in thumbnails directory
    const files = await FileSystem.readDirectoryAsync(thumbnailsDir)
    console.log(`Found ${files.length} files in thumbnails directory:`, files)
    
    // Delete all files in thumbnails directory
    let deletedCount = 0
    for (const file of files) {
      const filePath = `${thumbnailsDir}/${file}`
      await FileSystem.deleteAsync(filePath, { idempotent: true })
      console.log('Deleted file:', file)
      deletedCount++
    }
    
    console.log(`Cleared ${deletedCount} files from thumbnails directory`)
    
    // Verify the directory is now empty
    const remainingFiles = await FileSystem.readDirectoryAsync(thumbnailsDir)
    console.log(`Remaining files after clear: ${remainingFiles.length}`)
    
    // Also clear the metadata
    await clearCachedImagesMetadata()
    console.log('Cleared cached images metadata')
  } catch (error) {
    console.error('Failed to clear thumbnails:', error)
    throw error
  }
}

export async function listAllThumbnails(): Promise<string[]> {
  try {
    const docDir = FileSystem.documentDirectory
    if (!docDir) {
      throw new Error('Document directory not available')
    }
    
    const thumbnailsDir = `${docDir}thumbnails`
    
    // Check if thumbnails directory exists
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir)
    if (!dirInfo.exists) {
      console.log('Thumbnails directory does not exist')
      return []
    }
    
    // List all files in thumbnails directory
    const files = await FileSystem.readDirectoryAsync(thumbnailsDir)
    console.log(`Found ${files.length} thumbnail files:`, files)
    return files
  } catch (error) {
    console.error('Failed to list thumbnails:', error)
    return []
  }
}

// Helper function to sort HistoryImage array by timestamp (newest first)
export function sortImagesByDate(images: HistoryImage[]): HistoryImage[] {
  return images.sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp)
    return dateB.getTime() - dateA.getTime() // Newest first
  })
}

export async function cleanupOrphanedMetadata(): Promise<void> {
  try {
    const docDir = FileSystem.documentDirectory;
    if (!docDir) {
      throw new Error('Document directory not available');
    }
    
    const thumbnailsDir = `${docDir}thumbnails`;
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
    
    if (!dirInfo.exists) {
      // If no thumbnails directory, clear all metadata
      await clearCachedImagesMetadata();
      console.log('No thumbnails directory found, cleared all metadata');
      return;
    }
    
    // Get all thumbnail files
    const thumbnailFiles = await FileSystem.readDirectoryAsync(thumbnailsDir);
    const jpgThumbnails = thumbnailFiles.filter(file => file.endsWith('.jpg'));
    
    // Extract filenames (remove 'thumb_' prefix and '.jpg' suffix)
    const thumbnailIds = jpgThumbnails.map(file => file.replace(/^thumb_/, '').replace(/\.jpg$/, ''));
    
    // Load current metadata
    const metadata = await loadCachedImagesMetadata();
    const metadataIds = Object.keys(metadata);
    
    // Find orphaned metadata entries
    const orphanedIds = metadataIds.filter(id => !thumbnailIds.includes(id));
    
    if (orphanedIds.length > 0) {
      console.log(`Found ${orphanedIds.length} orphaned metadata entries:`, orphanedIds);
      
      // Remove orphaned entries
      const cleanedMetadata: Record<string, CachedImageMetadata> = {};
      for (const [id, meta] of Object.entries(metadata)) {
        if (!orphanedIds.includes(id)) {
          cleanedMetadata[id] = meta;
        }
      }
      
      // Save cleaned metadata
      const storagePath = getCachedImagesPath();
      await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(cleanedMetadata));
      console.log(`Cleaned up ${orphanedIds.length} orphaned metadata entries`);
    } else {
      console.log('No orphaned metadata entries found');
    }
  } catch (error) {
    console.error('Failed to cleanup orphaned metadata:', error);
  }
}

// Debug function to analyze image array and identify issues
export function debugImageArray(images: HistoryImage[], source: string): void {
  console.log(`=== Debug Image Array (${source}) ===`);
  console.log(`Total images: ${images.length}`);
  
  const imagesWithMetadata = images.filter(img => img.prompt && img.prompt !== 'Cached image' && img.prompt !== 'No prompt available');
  const imagesWithoutMetadata = images.filter(img => !img.prompt || img.prompt === 'Cached image' || img.prompt === 'No prompt available');
  
  console.log(`Images with metadata: ${imagesWithMetadata.length}`);
  console.log(`Images without metadata: ${imagesWithoutMetadata.length}`);
  
  // Check for duplicates by filename
  const filenameCounts = new Map<string, number>();
  images.forEach(img => {
    const filename = img.filename;
    filenameCounts.set(filename, (filenameCounts.get(filename) || 0) + 1);
  });
  
  const duplicates = Array.from(filenameCounts.entries()).filter(([filename, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} filenames with duplicates:`);
    duplicates.forEach(([filename, count]) => {
      console.log(`  ${filename}: ${count} instances`);
    });
  }
  
  // Show some examples of images without metadata
  if (imagesWithoutMetadata.length > 0) {
    console.log(`Examples of images without metadata:`);
    imagesWithoutMetadata.slice(0, 5).forEach(img => {
      console.log(`  ${img.filename}: prompt="${img.prompt}", id="${img.id}"`);
    });
  }
  
  console.log(`=== End Debug Image Array ===`);
}

// Function to force refresh metadata for all cached images
export async function forceRefreshMetadata(): Promise<void> {
  try {
    console.log('=== Force Refreshing Metadata ===');
    
    const docDir = FileSystem.documentDirectory;
    if (!docDir) {
      throw new Error('Document directory not available');
    }
    
    const thumbnailsDir = `${docDir}thumbnails`;
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
    
    if (!dirInfo.exists) {
      console.log('No thumbnails directory found');
      return;
    }
    
    // Get all thumbnail files
    const thumbnailFiles = await FileSystem.readDirectoryAsync(thumbnailsDir);
    const jpgThumbnails = thumbnailFiles.filter(file => file.endsWith('.jpg'));
    
    console.log(`Found ${jpgThumbnails.length} thumbnails to process`);
    
    // Load current metadata
    const currentMetadata = await loadCachedImagesMetadata();
    console.log(`Current metadata entries: ${Object.keys(currentMetadata).length}`);
    
    // Process each thumbnail
    for (const thumbnailFile of jpgThumbnails) {
      const filename = thumbnailFile.replace(/^thumb_/, '').replace(/\.jpg$/, '');
      const safeId = filename;
      
      // Check if metadata exists for this thumbnail
      if (!currentMetadata[safeId]) {
        console.log(`No metadata found for ${filename}, creating fallback metadata`);
        
        // Create fallback metadata
        const fallbackMetadata: CachedImageMetadata = {
          id: safeId,
          filename: filename,
          prompt: 'Cached image - metadata not available',
          timestamp: new Date().toISOString(),
          url: `file://${thumbnailsDir}/${thumbnailFile}`,
        };
        
        // Save the fallback metadata
        await saveCachedImageMetadata(fallbackMetadata);
        console.log(`Created fallback metadata for ${filename}`);
      }
    }
    
    console.log('=== Metadata refresh completed ===');
  } catch (error) {
    console.error('Failed to force refresh metadata:', error);
  }
} 