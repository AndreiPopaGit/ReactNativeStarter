// --- START OF FILE hooks/useFoodScanner.ts ---
// PART 1 of 3

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView, CameraType, CameraPictureOptions } from 'expo-camera';
import { analyzeFoodImage } from '../lib/api'; // Adjust path to your API service file
import { FoodItem } from '../types'; // Adjust path to your types file

// Type for the picture result from expo-camera
interface CameraCapturedPicture {
    uri: string;
    width: number;
    height: number;
    base64?: string;
    exif?: any;
}

// Updated state without 'preview'
type CaptureState = 'camera' | 'analyzing' | 'results' | 'error';

// Updated return type for the hook
export interface UseFoodScannerReturn {
  captureState: CaptureState;
  capturedImageForDisplay: CameraCapturedPicture | null; // Image for results screen
  recognizedFood: FoodItem[] | null;
  isLoading: boolean;
  analysisProgress: number; // 0-1
  cameraRef: React.RefObject<CameraView>;
  cameraType: CameraType; // Should be 'front' | 'back'
  takeAndAnalyzePicture: () => Promise<void>; // Combined action
  handleRetake: () => void; // For resetting from results/error
  toggleCameraType: () => void;
}

export function useFoodScanner(): UseFoodScannerReturn {
  const cameraRef = useRef<CameraView>(null);
  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [capturedImageForDisplay, setCapturedImageForDisplay] = useState<CameraCapturedPicture | null>(null);
  const [recognizedFood, setRecognizedFood] = useState<FoodItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [cameraType, setCameraType] = useState<CameraType>('back'); // Use 'back' string

  // Progress effect remains the same
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (captureState === 'analyzing') {
      setAnalysisProgress(0);
      interval = setInterval(() => {
        setAnalysisProgress(prev => (prev >= 0.95 ? 0.95 : prev + 0.01)); // Stop near end
      }, 50); // Adjust interval timing if needed
      return () => { if (interval) clearInterval(interval); };
    } else {
        setAnalysisProgress(0); // Reset progress if not analyzing
    }
     // Cleanup on unmount
     return () => { if (interval) clearInterval(interval); };
  }, [captureState]);

  // Internal function to handle the analysis part
  const internalHandleAnalyze = useCallback(async (photo: CameraCapturedPicture) => {
    // Create the object structure your analyzeFoodImage function expects.
    // This might require adding mimeType, fileName etc. based on that function.
     const imageAssetForApi = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        mimeType: 'image/jpeg', // <<< ASSUMPTION: Make sure this is correct or obtained
        fileName: `scan_${Date.now()}.jpg`, // <<< Example filename
        // Add other fields if analyzeFoodImage requires them
    };

    setCaptureState('analyzing'); // Move to analyzing state
    setIsLoading(true); // Set loading true for analysis phase
    setRecognizedFood(null); // Clear previous results

    try {
      console.log("Calling analyzeFoodImage with:", imageAssetForApi);
      // @ts-ignore - Remove this ignore if analyzeFoodImage input type matches imageAssetForApi structure
      const analysisResult = await analyzeFoodImage(imageAssetForApi);

      if (analysisResult && analysisResult.length > 0) {
          console.log("Analysis successful:", analysisResult);
          setRecognizedFood(analysisResult);
          setAnalysisProgress(1); // Complete progress
          setCaptureState('results');
     } else {
         // Handle case where analysis returned empty results
         console.log("Analysis complete, but no food identified.");
         Alert.alert('Analysis Complete', 'Could not identify food items in the image.');
         setCaptureState('camera'); // Go back to camera
     }
    } catch (error: unknown) {
      let message = 'Analysis failed.';
      if (error instanceof Error) message = error.message;
      console.error("Analysis error:", error);
      Alert.alert('Analysis Failed', message);
      setAnalysisProgress(0);
      setCaptureState('camera'); // Go back to camera on error
    } finally {
      setIsLoading(false); // Analysis finished (success or fail)
    }
  }, []); // Should not have external dependencies

  // Combined function: Takes picture, then triggers analysis
  const takeAndAnalyzePicture = useCallback(async () => {
      if (!cameraRef.current) {
          Alert.alert('Error', 'Camera component is not ready.');
          console.error('takeAndAnalyzePicture called but cameraRef is not set.');
          return;
      }
      // Indicate loading/processing starts now
      setIsLoading(true);
      try {
          console.log("Taking picture...");
          const options: CameraPictureOptions = { quality: 0.5, base64: false, skipProcessing: true };
          const photo = await cameraRef.current.takePictureAsync(options);

          if (photo?.uri) { // Check if photo and uri exist
              console.log("Picture taken:", photo.uri);
              setCapturedImageForDisplay(photo); // Save for results display
              // Don't set loading false here, let internalHandleAnalyze handle it
              await internalHandleAnalyze(photo); // Trigger analysis
          } else {
               console.error("Camera failed to return picture data.");
               throw new Error("Camera failed to return picture data.");
          }
      } catch (error: unknown) {
          let message = 'Could not take picture.';
          if (error instanceof Error) message = error.message;
          console.error('Error during takeAndAnalyzePicture:', error);
          Alert.alert('Camera Error', message);
          setCaptureState('camera'); // Reset state on error
          setIsLoading(false); // Ensure loading stops on capture error
      }
  }, [cameraRef, internalHandleAnalyze]); // Dependencies

  // Resets state back to the initial camera view
  const handleRetake = useCallback(() => {
    console.log("handleRetake called: Resetting to camera state");
    setCaptureState('camera');
    setCapturedImageForDisplay(null);
    setRecognizedFood(null);
    setIsLoading(false);
    setAnalysisProgress(0);
  }, []);

  // Toggles between front and back camera
  const toggleCameraType = useCallback(() => {
    console.log("Toggling camera type");
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  // Return state and functions needed by the UI component
  return {
    captureState,
    capturedImageForDisplay,
    recognizedFood,
    isLoading,
    analysisProgress,
    cameraRef,
    cameraType,
    takeAndAnalyzePicture,
    handleRetake,
    toggleCameraType,
  };
}
// --- END OF FILE hooks/useFoodScanner.ts ---
// --- END OF PART 1 ---