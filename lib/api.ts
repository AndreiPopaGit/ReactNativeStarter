// lib/api.ts (or services/FoodAnalysisService.ts)
import axios from 'axios';
import { ImagePickerAsset } from 'expo-image-picker';

// Re-use the FoodItem interface (or import it from a shared types file)
interface FoodItem {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

const API_URL = "https://test-fast-api-omega.vercel.app/upload/";

export async function analyzeFoodImage(imageAsset: ImagePickerAsset): Promise<FoodItem[]> {
  if (!imageAsset.uri) {
    throw new Error("Image asset URI is missing.");
  }

  const file = {
    uri: imageAsset.uri,
    type: imageAsset.mimeType || 'image/jpeg', // Use mimeType if available
    name: imageAsset.fileName || `scan_${Date.now()}.jpg`,
  };

  const formData = new FormData();
  formData.append('file', file as any); // Cast needed for RN FormData

  console.log("📤 Sending request to:", API_URL);
  console.log("📦 FormData contents:", { uri: file.uri, type: file.type, name: file.name });

  try {
    const response = await axios.post<{ json: FoodItem[] }>(
      API_URL,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // Example timeout
      }
    );

    console.log("✅ Response status:", response.status);
    console.log("📡 Response data:", response.data);

    if (response.data && Array.isArray(response.data.json)) {
      return response.data.json;
    } else {
      console.error('Invalid API response format:', response.data);
      throw new Error('Received invalid data format from server.');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Axios Upload error:", { /* ... logging ... */ });
      const apiErrorDetail = typeof error.response?.data?.detail === 'string' ? error.response.data.detail : null;
      throw new Error(apiErrorDetail || error.message || `Upload failed (Status: ${error.response?.status ?? 'N/A'})`);
    } else if (error instanceof Error) {
       console.error("❌ Generic Upload error:", error.message);
       throw error; // Re-throw generic error
    } else {
       console.error("❌ Unexpected Upload error object:", error);
       throw new Error('An unknown upload error occurred.');
    }
  }
}