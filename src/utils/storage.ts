import * as FileSystem from 'expo-file-system'

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

const SETTINGS_KEY = 'user_settings.json'

const getStoragePath = (): string => {
  const docDir = FileSystem.documentDirectory
  if (!docDir) {
    throw new Error('Document directory not available')
  }
  return `${docDir}${SETTINGS_KEY}`
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