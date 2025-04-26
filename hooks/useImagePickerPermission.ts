// hooks/useImagePickerPermission.ts
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PermissionStatus = boolean | null; // null = loading, boolean = granted/denied

export function useImagePickerPermission(): [PermissionStatus, () => Promise<void>] {
  const [hasPermission, setHasPermission] = useState<PermissionStatus>(null);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } else {
      console.warn("Camera permissions not applicable on web for ImagePicker.");
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    requestPermission(); // Request on mount
  }, [requestPermission]);

  return [hasPermission, requestPermission];
}