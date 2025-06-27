export interface HistoryImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  imageData?: string; // Base64 encoded image data
  filename: string; // Original filename from server
  model?: string;
  width?: number;
  height?: number;
  sampler?: string;
  scheduler?: string;
  steps?: number;
  cfg_scale?: number; // legacy/compatibility
  cfgscale?: number; // for new mapping
  negativePrompt?: string;
  seed?: number;
  modelFile?: string;
  date?: string;
  thumbnailUri?: string; // Local URI of the 64x64 thumbnail
  [key: string]: any; // Allow for any additional metadata fields
} 