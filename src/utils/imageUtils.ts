import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';
import { MODEL_CONFIG, UI_CONFIG } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const calculateImageDimensions = (windowHeight: number) => {
  const bottomBarHeight = UI_CONFIG.BOTTOM_BAR_HEIGHT;
  const imageAreaHeight = windowHeight - bottomBarHeight;
  
  // For portrait images, fit width or height, whichever is smaller
  const imageWidth = SCREEN_WIDTH;
  const imageHeight = imageWidth * (MODEL_CONFIG.DEFAULT_HEIGHT / MODEL_CONFIG.DEFAULT_WIDTH);
  const finalImageHeight = Math.min(imageHeight, imageAreaHeight);
  const finalImageWidth = finalImageHeight * (MODEL_CONFIG.DEFAULT_WIDTH / MODEL_CONFIG.DEFAULT_HEIGHT);

  return {
    finalImageWidth,
    finalImageHeight,
    imageAreaHeight,
  };
};

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
 * Creates a 64x64 thumbnail from a base64 image and stores it on device.
 * @param imageData The base64 string of the image (data:image/png;base64,...) or URL
 * @param id Unique id for the image (used for filename)
 * @returns The local URI of the stored thumbnail
 */
export async function createAndStoreThumbnail(imageData: string, id: string): Promise<string> {
  console.log('Fetched image data:', imageData?.slice(0, 100)); // Log first 100 chars for debugging
  let base64 = imageData;
  if (base64.startsWith('data:')) {
    base64 = base64.replace(/^data:[^;]+;base64,/, '');
  }
  if (base64.startsWith('http')) {
    base64 = await urlToBase64(base64);
  }
  // Write the base64 image to a temporary file
  const tempPath = `${FileSystem.cacheDirectory}temp_${id}.png`;
  const tempDir = tempPath.substring(0, tempPath.lastIndexOf('/'));
  await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
  await FileSystem.writeAsStringAsync(tempPath, base64, { encoding: FileSystem.EncodingType.Base64 });
  // Resize to 64x64 using expo-image-manipulator
  const manipResult = await ImageManipulator.manipulateAsync(
    tempPath,
    [{ resize: { width: 128, height: 128 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.PNG }
  );
  // Save the thumbnail to a permanent location
  const thumbPath = `${FileSystem.documentDirectory}thumbnails/thumb_${id}.png`;
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}thumbnails/`, { intermediates: true }).catch(() => {});
  await FileSystem.copyAsync({ from: manipResult.uri, to: thumbPath });
  await FileSystem.deleteAsync(tempPath, { idempotent: true });
  return thumbPath;
} 