// lib/api.ts
import axios from 'axios';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Re-use the FoodItem interface
interface FoodItem {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Define a complete FileInfo type with size
interface FileInfoWithSize {
  exists: boolean;
  uri: string;
  size: number;
  isDirectory: boolean;
  modificationTime: number;
  md5?: string;
}

const API_URL = "https://test-fast-api-omega.vercel.app/upload/";
const MAX_IMAGE_SIZE = 800; // Maximum width/height in pixels
const QUALITY = 0.7; // Image compression quality (0.0 - 1.0)

// Compress image to reduce file size
async function compressImage(uri: string): Promise<string> {
  try {
    console.log("📸 Compressing image...");
    
    // Get image info to determine if it needs resizing
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true }) as unknown as FileInfoWithSize;
    console.log(`📊 Original image size: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Perform image compression and resize
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_SIZE, height: MAX_IMAGE_SIZE } }],
      { compress: QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // Check new size
    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true }) as unknown as FileInfoWithSize;
    console.log(`📊 Compressed image size: ${(newFileInfo.size / 1024 / 1024).toFixed(2)} MB`);
    
    return manipResult.uri;
  } catch (error) {
    console.error("❌ Image compression failed:", error);
    // Fall back to original URI if compression fails
    return uri;
  }
}

// Check if file size exceeds a threshold
async function isFileTooLarge(uri: string, maxSizeMB = 5): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true }) as unknown as FileInfoWithSize;
    const fileSizeMB = fileInfo.size / 1024 / 1024;
    return fileSizeMB > maxSizeMB;
  } catch (error) {
    console.error("❌ Failed to check file size:", error);
    return false; // Assume it's not too large if we can't check
  }
}

export async function analyzeFoodImage(imageAsset: ImagePickerAsset): Promise<FoodItem[]> {
  if (!imageAsset.uri) {
    throw new Error("Image asset URI is missing.");
  }

  // 1. Increase timeout for large images
  const TIMEOUT = 180000; // 3 minutes
  
  try {
    // 2. Check file size and compress if needed
    const isTooLarge = await isFileTooLarge(imageAsset.uri, 3); // 3MB threshold
    
    let processedUri = imageAsset.uri;
    if (isTooLarge) {
      console.log("🔄 Image is large, compressing...");
      processedUri = await compressImage(imageAsset.uri);
    }
    
    const file = {
      uri: processedUri,
      type: imageAsset.mimeType || 'image/jpeg',
      name: imageAsset.fileName || `scan_${Date.now()}.jpg`,
    };

    const formData = new FormData();
    formData.append('file', file as any);

    // 3. Add custom headers to help with large requests
    const headers = { 
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      // Some servers need to know the content length upfront
      // But we can't reliably set Content-Length in React Native
    };

    console.log("📤 Sending request to:", API_URL);
    
    // 4. Use a cancelable request with progress tracking
    const source = axios.CancelToken.source();
    
    // Set a timeout to cancel if too long
    const timeoutId = setTimeout(() => {
      source.cancel('Request took too long');
    }, TIMEOUT);

    // 5. Make the request with extended configuration
    const response = await axios.post<{ json: FoodItem[] }>(
      API_URL,
      formData,
      {
        headers,
        timeout: 0,
        onUploadProgress: (progressEvent) => {
          // Type guard for progressEvent.total
          const total = progressEvent.total ?? 0; // Use nullish coalescing
          const percentCompleted = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
          console.log(`📤 Upload progress: ${percentCompleted}%`);
        },
        cancelToken: source.token,
        // Increase max content length
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log("✅ Response status:", response.status);
    
    if (response.data && Array.isArray(response.data.json)) {
      return response.data.json;
    } else {
      console.error('Invalid API response format:', response.data);
      throw new Error('Received invalid data format from server.');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Axios Upload error:", {
        status: error.response?.status,
        message: error.message,
        code: error.code
      });
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 504) {
        throw new Error('The server took too long to process your image. Try using a clearer image with fewer food items.');
      } else if (error.response?.status === 413) {
        throw new Error('The image is too large for the server to handle. Please take a photo with fewer food items or from a different angle.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('The request timed out. Please check your internet connection and try again.');
      } else if (error.message.includes('Network Error')) {
        throw new Error('Network connection error. Please check your internet connection and try again.');
      }
      
      const apiErrorDetail = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : null;
        
      throw new Error(apiErrorDetail || error.message || `Upload failed (Status: ${error.response?.status ?? 'N/A'})`);
    } else if (error instanceof Error) {
      console.error("❌ Generic Upload error:", error.message);
      throw error;
    } else {
      console.error("❌ Unexpected Upload error object:", error);
      throw new Error('An unknown error occurred while analyzing your food.');
    }
  }
}

// Fallback strategy for very complex images
export async function tryMultipleCompressionLevels(imageAsset: ImagePickerAsset): Promise<FoodItem[]> {
  // First try with normal compression
  try {
    return await analyzeFoodImage(imageAsset);
  } catch (error: any) {
    // If we get 413 or 504, try with more aggressive compression
    if (error.message.includes('413') || error.message.includes('504') || 
        error.message.includes('too large') || error.message.includes('timed out')) {
      
      console.log("🔄 First attempt failed, trying with more aggressive compression...");
      
      // Override the global constants for this attempt
      const EXTREME_QUALITY = 0.4; // More aggressive compression
      const SMALLER_SIZE = 600; // Smaller max dimensions
      
      try {
        if (!imageAsset.uri) {
          throw new Error("Image asset URI is missing.");
        }
        
        // Compress more aggressively
        const compressedUri = await ImageManipulator.manipulateAsync(
          imageAsset.uri,
          [{ resize: { width: SMALLER_SIZE, height: SMALLER_SIZE } }],
          { compress: EXTREME_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        // Create modified asset with compressed URI
        const compressedAsset = {
          ...imageAsset,
          uri: compressedUri.uri
        };
        
        // Try again with the more compressed image
        return await analyzeFoodImage(compressedAsset);
      } catch (secondError) {
        console.error("❌ Second attempt also failed:", secondError);
        throw new Error('Unable to analyze this image even after compression. Please try a different photo with fewer food items.');
      }
    }
    
    // If it's a different error, just re-throw it
    throw error;
  }
}