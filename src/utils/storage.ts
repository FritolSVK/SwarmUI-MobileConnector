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
  return originalId || `cached_${filename.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}`
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