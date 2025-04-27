// hooks/useFoodScanner.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView, CameraType, CameraPictureOptions } from 'expo-camera';
import { analyzeFoodImage, tryMultipleCompressionLevels } from '../lib/api';
import { FoodItem } from '../types';

// Interface for the picture result from expo-camera
interface CameraCapturedPicture {
    uri: string;
    width: number;
    height: number;
    base64?: string;
    exif?: any;
}

type CaptureState = 'camera' | 'analyzing' | 'results' | 'error';

export interface UseFoodScannerReturn {
  captureState: CaptureState;
  capturedImageForDisplay: CameraCapturedPicture | null;
  recognizedFood: FoodItem[] | null;
  isLoading: boolean;
  analysisProgress: number;
  cameraRef: React.RefObject<CameraView>;
  cameraType: CameraType;
  takeAndAnalyzePicture: () => Promise<void>;
  handleRetake: () => void;
  toggleCameraType: () => void;
}

export function useFoodScanner(): UseFoodScannerReturn {
  const cameraRef = useRef<CameraView>(null);
  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [capturedImageForDisplay, setCapturedImageForDisplay] = useState<CameraCapturedPicture | null>(null);
  const [recognizedFood, setRecognizedFood] = useState<FoodItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const analysisAttempts = useRef<number>(0);

  // Progress effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (captureState === 'analyzing') {
      setAnalysisProgress(0);
      interval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Slow down progress near the end to avoid false completion appearance
          if (prev >= 0.9) return 0.9 + (prev - 0.9) * 0.1;
          return prev + 0.01;
        });
      }, 100);
      return () => { if (interval) clearInterval(interval); };
    } else {
      setAnalysisProgress(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [captureState]);

  // Internal function to handle the analysis part
  const internalHandleAnalyze = useCallback(async (photo: CameraCapturedPicture) => {
    // Reset attempt counter
    analysisAttempts.current = 0;
    
    const imageAssetForApi = {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      mimeType: 'image/jpeg',
      fileName: `scan_${Date.now()}.jpg`,
    };

    setCaptureState('analyzing');
    setIsLoading(true);
    setRecognizedFood(null);

    try {
      console.log("Calling food analysis with advanced handling...");
      
      // Use the multi-level compression approach
      const analysisResult = await tryMultipleCompressionLevels(imageAssetForApi);

      if (analysisResult && analysisResult.length > 0) {
        console.log("Analysis successful:", analysisResult);
        setRecognizedFood(analysisResult);
        setAnalysisProgress(1);
        setCaptureState('results');
      } else {
        console.log("Analysis complete, but no food identified.");
        Alert.alert('No Food Detected', 'Could not identify any food items in the image. Please try again with a clearer photo.');
        setCaptureState('camera');
      }
    } catch (error: unknown) {
      let message = 'Analysis failed.';
      if (error instanceof Error) message = error.message;
      console.error("Analysis error:", error);
      Alert.alert('Analysis Failed', message);
      setAnalysisProgress(0);
      setCaptureState('camera');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Takes picture and triggers analysis
  const takeAndAnalyzePicture = useCallback(async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera component is not ready.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Taking picture...");
      // Lower quality to reduce file size
      const options: CameraPictureOptions = { 
        quality: 0.8,
        base64: false,
        skipProcessing: false // Let system process the image
      };
      
      const photo = await cameraRef.current.takePictureAsync(options);

      if (photo?.uri) {
        console.log("Picture taken:", photo.uri);
        setCapturedImageForDisplay(photo);
        await internalHandleAnalyze(photo);
      } else {
        console.error("Camera failed to return picture data.");
        throw new Error("Camera failed to return picture data.");
      }
    } catch (error: unknown) {
      let message = 'Could not take picture.';
      if (error instanceof Error) message = error.message;
      console.error('Error during takeAndAnalyzePicture:', error);
      Alert.alert('Camera Error', message);
      setCaptureState('camera');
      setIsLoading(false);
    }
  }, [cameraRef, internalHandleAnalyze]);

  // Reset state back to camera view
  const handleRetake = useCallback(() => {
    console.log("handleRetake called: Resetting to camera state");
    setCaptureState('camera');
    setCapturedImageForDisplay(null);
    setRecognizedFood(null);
    setIsLoading(false);
    setAnalysisProgress(0);
  }, []);

  // Toggle camera type
  const toggleCameraType = useCallback(() => {
    console.log("Toggling camera type");
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  }, []);

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