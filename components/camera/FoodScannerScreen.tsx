import React, { useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Alert,
  View,
  Text, // Import Text if needed (e.g., for camera overlay header)
  TouchableOpacity, // Import for overlay buttons
  ActivityIndicator, // Import for loading state on capture button
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Make sure this is installed

// Import CameraView related items
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

// Import Hooks
import { useFoodScanner } from '../../hooks/useFoodScanner'; // Adjust path as needed

// Import Presentational Components
import AnalyzingView from '../foodScanner/LoadingSpinner'; // Adjust path
import { ResultsView } from '../foodScanner/ResultsView'; // Adjust path
import { PermissionLoadingView } from '../common/PermissionLoadingView'; // Adjust path
import { PermissionDeniedView } from '../common/PermisionDeniedView'; // Adjust path
import { ErrorFallbackView } from '../common/ErrorFallBackView'; // Adjust path

// Import types
import { FoodItem, Meal, MealFoodItem } from '../../types'; // Adjust path as needed

export default function FoodScannerScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const {
    captureState,
    capturedImageForDisplay, // Use this for passing to ResultsView
    recognizedFood,
    isLoading,
    analysisProgress,
    cameraRef,
    cameraType,
    takeAndAnalyzePicture, // The combined action for the capture button
    handleRetake,         // Used for errors and the "Scan Again" button in ResultsView
    toggleCameraType,
  } = useFoodScanner();

  // --- Add To Log Logic ---
  // (Stays in the main component as it needs navigation/router)
  const handleAddToLog = useCallback(async (itemsToLog: FoodItem[]) => {
    if (!itemsToLog || itemsToLog.length === 0) {
      console.log("Add to log called but no food recognized.");
      Alert.alert('No Food Data', 'Cannot add to log as no food was identified.');
      return;
    }
    console.log("Attempting to add to log:", itemsToLog);
    try {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const storedMealsJSON = await AsyncStorage.getItem('todayMeals');
      let todayMeals: Meal[] = [];
      try {
        if (storedMealsJSON) {
          const parsed = JSON.parse(storedMealsJSON);
          if (Array.isArray(parsed)) {
            todayMeals = parsed;
          } else {
            console.warn('Stored meals was not an array, resetting.');
            todayMeals = [];
          }
        }
      } catch (e) {
        console.error("Error parsing stored meals:", e);
        todayMeals = [];
      }

      // Define the structure for items within the Meal's foods array
      const newMealFoods: MealFoodItem[] = itemsToLog.map((food: FoodItem): MealFoodItem => ({
        id: `food-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        quantity: 100,
        name: food.name,
        kcal: Number(food.kcal) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fats: Number(food.fats) || 0,
      }));

      const newMeal: Meal = {
        id: `scan-${Date.now()}`,
        name: itemsToLog[0]?.name || 'Scanned Meal',
        time,
        foods: newMealFoods,
      };

      todayMeals.push(newMeal);
      await AsyncStorage.setItem('todayMeals', JSON.stringify(todayMeals));
      console.log("Meals saved to AsyncStorage");

      navigation.getParent()?.setParams({ mealsUpdated: Date.now() });

      Alert.alert('Success', `${newMeal.name} added to your log!`);
      router.push('/(tabs)/home');

    } catch (error: unknown) {
      let msg = 'Could not save the food to your log.';
      if (error instanceof Error) msg = error.message;
      console.error('Add to log error:', error);
      Alert.alert('Error', msg);
    }
  }, [navigation, router]);

  // --- Conditional Rendering ---
  const renderContent = () => {
    // 1. Check Permissions
    if (!permission) {
      return <PermissionLoadingView />;
    }
    if (!permission.granted) {
      return <PermissionDeniedView onGrantPermission={requestPermission} onGoBack={() => navigation.goBack()} />;
    }

    // 2. Render based on captureState (Permission is granted now)
    switch (captureState) {
      case 'camera':
        // Render the live camera preview with custom overlay
        return (
          <View style={styles.fullScreen}>
            <CameraView
              style={styles.cameraPreview}
              facing={cameraType} // Use the state variable ('front' or 'back')
              ref={cameraRef}     // Connect the ref
            // ratio="16:9" // Add if needed for aspect ratio control
            >
              {/* Overlay UI on top of the camera */}
              <View style={styles.cameraOverlay}>
                {/* Optional Header Text */}
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraText}>Center Food Item</Text>
                </View>

                {/* Optional: Visual Guide Frame */}
                {/* <View style={styles.cameraGuideFrame} /> */}

                {/* Bottom Controls */}
                <View style={styles.cameraControls}>
                  {/* Flip Camera Button */}
                  <TouchableOpacity style={styles.cameraControlButton} onPress={toggleCameraType}>
                    <Ionicons name="camera-reverse-outline" size={28} color="white" />
                  </TouchableOpacity>

                  {/* Custom Capture Button */}
                  <TouchableOpacity style={styles.captureButton} onPress={takeAndAnalyzePicture} disabled={isLoading}>
                    {/* Show spinner on button if taking picture/starting analysis */}
                    {isLoading ? <ActivityIndicator color="black" size="large" /> : <View style={styles.captureButtonInner} />}
                  </TouchableOpacity>

                  {/* Placeholder for alignment */}
                  <TouchableOpacity style={styles.cameraControlButton} disabled={true}>
                    <View style={{ width: 28, height: 28 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        );

      case 'analyzing':
        // Wrap AnalyzingView in a container that centers it
        return (
          <View style={styles.centeredContainer}>
            <AnalyzingView />
          </View>
        );

      case 'results':
        // Check if recognizedFood has data before rendering ResultsView
        return recognizedFood && recognizedFood.length > 0 ? (
          <ResultsView
            imageUri={capturedImageForDisplay?.uri}
            foodData={recognizedFood}
            onAddToLog={handleAddToLog}    // Now expects items as a parameter
            onRetake={handleRetake}
          />
        ) : (
          <ErrorFallbackView
            message="Could not identify food items."
            onRetry={handleRetake}
            retryLabel="Try Again"
          />
        );

      case 'error': // Optional state if useFoodScanner sets it
        return <ErrorFallbackView message="An error occurred during scanning." onRetry={handleRetake} />;

      default:
        // Fallback for any unexpected state
        console.warn("Reached default case in renderContent, state:", captureState);
        return <ErrorFallbackView message="An unexpected error occurred." onRetry={handleRetake} />;
    }
  };

  // --- Final Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderContent()}
    </SafeAreaView>
  );
}

// --- STYLES ---
// (Include styles for SafeArea, Camera, Overlay, Buttons, Centering Container)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Background color depends on the active view. Camera state needs black.
    // Other states might use '#f8fafc'. Setting it here might cause flashes.
    // It's often better to set background color on the specific view containers.
    backgroundColor: '#000', // Default to black for camera state initially
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000', // Explicit black background for camera container
  },
  cameraPreview: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust top padding
  },
  cameraHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // cameraGuideFrame: { // Optional: Style for a visual guide frame
  //     position: 'absolute', top: '20%', bottom: '25%', left: '10%', right: '10%',
  //     borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 12,
  // },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraControlButton: {
    padding: 10,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 28,
  },
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  // Container style for centering non-fullscreen views like Analyzing/Error
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc', // Background for non-camera states
  },
});