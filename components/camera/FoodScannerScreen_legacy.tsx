// // --- START OF FILE FoodScannerScreen.tsx ---
// // PART 1 of 3

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   Dimensions,
//   Button, // Added Button for permission request
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { ImagePickerAsset } from 'expo-image-picker'; // Import the type for image assets
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native'; // Keep for goBack maybe
// import { useRouter } from 'expo-router'; // Correct import for Expo Router
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios'; // Ensure axios types are installed (@types/axios if needed, but usually included)

// // Define an interface for the expected food item structure from your API
// interface FoodItem {
//   // Assuming id is generated locally, API might not return it in the initial list
//   // id: string;
//   name: string;
//   kcal: number;
//   protein: number;
//   carbs: number;
//   fats: number;
//   // Add other properties if your API returns more
// }

// export default function FoodScannerScreen() {
//   const navigation = useNavigation();
//   const router = useRouter(); // Initialize Expo Router

//   // --- STATES ---
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Type: boolean or null
//   const [captureState, setCaptureState] = useState<'camera' | 'preview' | 'analyzing' | 'results'>('camera'); // More specific type
//   const [capturedImage, setCapturedImage] = useState<ImagePickerAsset | null>(null); // Type: Image asset or null
//   const [recognizedFood, setRecognizedFood] = useState<FoodItem[] | null>(null); // Type: Array of FoodItem or null
//   const [isLoading, setIsLoading] = useState<boolean>(false); // Type: boolean
//   const [analysisProgress, setAnalysisProgress] = useState<number>(0); // Type: number (progress bar value 0-1)

//   // --- EFFECTS ---
//   // Request permissions on mount
//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await ImagePicker.requestCameraPermissionsAsync();
//         setHasPermission(status === 'granted');
//       } else {
//         console.warn("Camera functionality is not supported on web using expo-image-picker's launchCameraAsync.");
//         setHasPermission(false); // Explicitly set to false on web
//       }
//     })();
//   }, []);

//   // Simulate progress bar animation during analysis
//   useEffect(() => {
//     let interval: NodeJS.Timeout | null = null; // Store interval ID
//     if (captureState === 'analyzing') {
//       setAnalysisProgress(0); // Reset progress
//       interval = setInterval(() => {
//         setAnalysisProgress(prev => {
//           // Simulate progress, stopping just before 100%
//           const newProgress = prev + 0.01;
//           // Stop at 0.9 to let the API call completion finish the bar if needed
//           return newProgress >= 0.9 ? 0.9 : newProgress;
//         });
//       }, 50); // Faster interval for smoother look

//       // Cleanup function to clear interval if component unmounts or state changes
//       return () => {
//         if (interval) {
//           clearInterval(interval);
//         }
//       };
//     } else {
//         // Reset progress if not analyzing (optional, but good practice)
//         setAnalysisProgress(0);
//     }
//     // Need cleanup function if component unmounts while interval running
//     return () => {
//         if (interval) {
//             clearInterval(interval);
//         }
//     }
//   }, [captureState]); // Re-run effect when captureState changes

//   // --- FUNCTIONS ---
//   const takePicture = async () => {
//     try {
//       // Re-check permission just in case it changed
//       const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
//       if (permissionResult.status !== 'granted') {
//         Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
//         setHasPermission(false); // Update state if permission denied now
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         quality: 0.5, // Keep quality reasonable for upload size
//         base64: false, // Base64 usually not needed for uploads
//         allowsEditing: false, // Usually disable editing for scans
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setCapturedImage(result.assets[0]); // result.assets is the correct structure now
//         setCaptureState('preview');
//         setRecognizedFood(null); // Clear previous results
//       } else {
//         console.log("Camera launch cancelled or failed to get assets.");
//       }
//     } catch (error: unknown) {
//       let message = 'Unable to access camera.';
//       if (error instanceof Error) {
//         message = error.message;
//       }
//       console.error('Camera error:', error);
//       Alert.alert('Camera Error', message);
//     }
//   };

//   const handleRetake = useCallback(() => { // Use useCallback if passed down, otherwise not strictly needed
//     console.log("Retake action");
//     setCaptureState('camera');
//     setCapturedImage(null);
//     setRecognizedFood(null);
//     setAnalysisProgress(0); // Reset progress too
//   }, []); // No dependencies needed here if only setting state

// // --- START OF PART 2 of 3 ---

// const handleAnalyze = async () => {
//   // Type guard to ensure capturedImage and its uri exist
//   if (!capturedImage?.uri) {
//       Alert.alert('Error', 'No image captured to analyze.');
//       console.error('handleAnalyze called without a valid capturedImage.uri');
//       setCaptureState('preview'); // Go back to preview if image somehow invalid
//       return;
//   }

//   console.log("Analyze action");
//   setCaptureState('analyzing');
//   setIsLoading(true); // Also set loading true

//   try {
//     // Construct file object for FormData
//     const file = {
//       uri: capturedImage.uri,
//       type: 'image/jpeg', // Or determine mime type dynamically if needed/possible
//       name: `scan_${Date.now()}.jpg`, // Create a unique name
//     };

//     const formData = new FormData();
//     // Use 'as any' for practical file upload typing in RN FormData
//     formData.append('file', file as any);

//     console.log("📤 Sending request to:", "https://test-fast-api-omega.vercel.app/upload/");
//     console.log("📦 FormData contents:", { uri: file.uri, type: file.type, name: file.name }); // Log cleanly

//     const uploadResponse = await axios.post<{ json: FoodItem[] }>( // Add expected response type
//       "https://test-fast-api-omega.vercel.app/upload/",
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         // Optional: Add timeout
//         // timeout: 30000, // 30 seconds
//       }
//     );

//     console.log("✅ Response status:", uploadResponse.status);
//     // console.log("📨 Headers:", uploadResponse.headers); // Usually too verbose
//     console.log("📡 Response data:", uploadResponse.data);

//     // Check if the expected 'json' property with an array exists
//     const resultData = uploadResponse.data;
//     if (resultData && Array.isArray(resultData.json)) {
//       setAnalysisProgress(1); // Set progress to 100% on success
//       setRecognizedFood(resultData.json); // Set the typed array
//       setCaptureState('results');
//     } else {
//       // Handle cases where API response format is wrong
//       console.error('Invalid API response format:', resultData);
//       throw new Error('Received invalid data format from server.');
//     }
//   } catch (error: unknown) { // Type error as unknown
//     setAnalysisProgress(0); // Reset progress on error
//     let errorMessage = 'An unknown upload error occurred';
//     // Check if it's an Axios error first
//     if (axios.isAxiosError(error)) {
//        console.error("❌ Axios Upload error:", {
//           message: error.message,
//           code: error.code,
//           response: error.response ? { status: error.response.status, data: error.response.data } : "No response",
//           request: error.request ? "Request made" : "No request",
//        });
//        // Try to get a more specific message from API response if available
//        const apiErrorDetail = typeof error.response?.data?.detail === 'string' ? error.response.data.detail : null;
//        errorMessage = apiErrorDetail || error.message || `Upload failed (Status: ${error.response?.status ?? 'N/A'})`;
//     } else if (error instanceof Error) { // Check for generic Error
//         console.error("❌ Generic Upload error:", error.message, error.stack);
//         errorMessage = error.message;
//     } else {
//         // Handle cases where it's not an Error object
//         console.error("❌ Unexpected Upload error object:", error);
//     }
//     Alert.alert('Analysis Failed', errorMessage);
//     setCaptureState('preview'); // Go back to preview on failure
//   } finally {
//     setIsLoading(false); // Ensure loading is stopped
//   }
// };

// const handleAddToFoodLog = async () => {
//   console.log("Add to log action");
//   try {
//     // Type guard for recognizedFood array
//     if (!recognizedFood || recognizedFood.length === 0) {
//       Alert.alert('No Foods', 'No recognized foods available to add!');
//       return;
//     }

//     const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     const storedMealsJSON = await AsyncStorage.getItem('todayMeals');
//     // Parse safely, provide default empty array if null or invalid JSON
//     let todayMeals: any[] = []; // Start with generic array type
//      try {
//          if (storedMealsJSON) {
//               todayMeals = JSON.parse(storedMealsJSON);
//               if (!Array.isArray(todayMeals)) { // Ensure it's actually an array
//                   console.warn('Stored meals was not an array, resetting.');
//                   todayMeals = [];
//               }
//          }
//      } catch (parseError) {
//          console.error('Failed to parse stored meals:', parseError);
//          todayMeals = []; // Reset if parsing fails
//      }

//     // Define the structure of a meal for type safety (adapt if needed)
//     interface Meal {
//       id: string;
//       name: string;
//       time: string;
//       foods: FoodItem[]; // Use the FoodItem interface
//     }

//     // Create the new meal object
//     const newMeal: Meal = {
//       id: `scan-${Date.now()}`,
//       name: 'Food Scan', // Or perhaps use the primary food name? e.g., recognizedFood[0]?.name
//       time,
//       foods: recognizedFood.map((food: FoodItem) => ({ // food is type FoodItem from API
//         // Create an object matching the FoodItem interface for the Meal.foods array
//         name: food.name,
//         kcal: food.kcal,    // <<< Use kcal property name
//         protein: food.protein,
//         carbs: food.carbs,
//         fats: food.fats,      // <<< Use fats property name
//         // Remove 'id' and 'quantity' as they are not part of the FoodItem interface
//       })),
//     };

//     todayMeals.push(newMeal);
//     await AsyncStorage.setItem('todayMeals', JSON.stringify(todayMeals));

//     // Optional chaining for safety when accessing parent navigator
//     navigation.getParent()?.setParams({ mealsUpdated: Date.now() });

//     Alert.alert('Success', 'Food added to your log!');

//     // Use Expo Router to navigate
//     router.push('/(tabs)/home'); // Navigate to home tab

//   } catch (error: unknown) { // Type error as unknown
//       let logErrorMessage = 'Could not save food log.';
//       if (error instanceof Error) {
//           logErrorMessage = error.message;
//       }
//       console.error('Log error:', error); // Log the original error object too
//       Alert.alert('Error', logErrorMessage);
//   }
// };

// // Calculate totals - types should be inferred correctly now if recognizedFood is typed
// const calculateTotalNutrition = (foods: FoodItem[]) => { // Add type annotation for input
//   // Explicitly type the accumulator 'totals'
//   return foods.reduce(
//     (totals: { calories: number; protein: number; carbs: number; fat: number }, f: FoodItem) => ({
//       calories: totals.calories + (f.kcal || 0),
//       protein: totals.protein + (f.protein || 0),
//       carbs: totals.carbs + (f.carbs || 0),
//       fat: totals.fat + (f.fats || 0), // Use 'fats' based on interface
//     }),
//     // Initial value for the accumulator
//     { calories: 0, protein: 0, carbs: 0, fat: 0 }
//   );
// };

// // --- RENDER LOGIC HELPER ---
// // (Moved renderStateIndicator here - can be defined before use)
// const renderStateIndicator = () => {
//  // This component purely visualizes state, no changes needed for TypeScript here
//  // unless you want to type its props if it were extracted
//  return (
//    <View style={styles.stateIndicator}>
//      {/* ... JSX remains the same ... */}
//      <Text style={styles.stateTitle}>Screen State:</Text>
//       <View style={styles.stateTabs}>
//         <TouchableOpacity
//           style={[styles.stateTab, captureState === 'camera' && styles.activeStateTab]}
//           disabled={true}
//         >
//           <Text style={[styles.stateTabText, captureState === 'camera' && styles.activeStateTabText]}>Camera</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.stateTab, captureState === 'preview' && styles.activeStateTab]}
//           disabled={true}
//         >
//           <Text style={[styles.stateTabText, captureState === 'preview' && styles.activeStateTabText]}>Preview</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.stateTab, captureState === 'analyzing' && styles.activeStateTab]}
//           disabled={true}
//         >
//           <Text style={[styles.stateTabText, captureState === 'analyzing' && styles.activeStateTabText]}>Analyzing</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.stateTab, captureState === 'results' && styles.activeStateTab]}
//           disabled={true}
//         >
//           <Text style={[styles.stateTabText, captureState === 'results' && styles.activeStateTabText]}>Results</Text>
//         </TouchableOpacity>
//       </View>
//    </View>
//  );
// };

// // --- START OF PART 3 of 3 ---

//   // --- RENDER LOGIC ---

//   // Loading Permissions State
//   if (hasPermission === null) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#3b82f6" />
//           <Text style={styles.loaderText}>Requesting camera permissions...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Permission Denied State
//   if (hasPermission === false) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         <View style={styles.container}>
//           <Ionicons name="alert-circle-outline" size={40} color="#ef4444" style={{ marginBottom: 10 }}/>
//           <Text style={styles.errorText}>Camera Permission Required</Text>
//           <Text style={styles.errorSubText}>Please grant camera permission in your device settings to use the scanner.</Text>
//           <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
//             <Text style={styles.buttonText}>Go Back</Text>
//           </TouchableOpacity>
//           {/* You could add a button to open settings using Linking API */}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // State: Camera (Initial state to trigger camera launch)
//   if (captureState === 'camera') {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         {/* This state doesn't show live preview, it shows a button to launch the external camera */}
//         <View style={styles.cameraContainer}>
//           <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#374151" />
//           </TouchableOpacity>

//           <View style={styles.cameraInstructionContent}>
//              <Ionicons name="camera-outline" size={80} color="#3b82f6" style={{ marginBottom: 20 }}/>
//              <Text style={styles.cameraTitle}>Scan Food Item</Text>
//              <Text style={styles.cameraSubtitle}>Press the button below to open the camera and take a photo of your food.</Text>

//              <TouchableOpacity style={styles.bigLaunchButton} onPress={takePicture}>
//                <Ionicons name="camera" size={22} color="#fff" style={{ marginRight: 10 }} />
//                <Text style={styles.bigLaunchButtonText}>Launch Camera</Text>
//              </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // State: Preview Image
//   // Add type guard: only render if capturedImage exists
//   if (captureState === 'preview' && capturedImage) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         <View style={styles.previewContainer}>
//           <View style={styles.previewHeader}>
//             <TouchableOpacity onPress={handleRetake}>
//               <Ionicons name="close" size={28} color="#374151" />
//             </TouchableOpacity>
//             <Text style={styles.previewTitle}>Image Preview</Text>
//             <View style={{ width: 28 }} /> {/* Spacer */}
//           </View>

//           {/* Image requires capturedImage to exist */}
//           <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} resizeMode="contain"/>

//           <View style={styles.previewControls}>
//             <TouchableOpacity style={styles.retakeButton} onPress={handleRetake} disabled={isLoading}>
//               <Ionicons name="refresh" size={20} color="#374151" />
//               <Text style={styles.retakeButtonText}>Retake</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze} disabled={isLoading}>
//                {isLoading ? (
//                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
//                ) : (
//                    <Ionicons name="scan" size={20} color="white" style={{ marginRight: 8 }} />
//                )}
//               <Text style={styles.analyzeButtonText}>{isLoading ? 'Analyzing...' : 'Analyze'}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // State: Analyzing
//   if (captureState === 'analyzing') {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         <View style={styles.analyzingContainer}>
//           <View style={styles.analyzingContent}>
//             <View style={styles.loaderCircle}>
//               <ActivityIndicator size="large" color="#3b82f6" />
//             </View>

//             <Text style={styles.analyzingTitle}>Analyzing your food</Text>
//             <Text style={styles.analyzingSubtitle}>
//               Our AI is identifying ingredients and calculating nutritional information...
//             </Text>

//             <View style={styles.progressBarContainer}>
//               <View style={[styles.progressBar, { width: `${analysisProgress * 100}%` }]} />
//             </View>

//             {/* Optional: Show estimated time or different messages based on progress */}
//             {/* <Text style={styles.analyzingTimeEstimate}>This might take a moment...</Text> */}
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // State: Results
//   // Add type guard: only render if recognizedFood array exists and has items
//   if (captureState === 'results' && recognizedFood && recognizedFood.length > 0) {
//     const total = calculateTotalNutrition(recognizedFood); // Pass the typed array
//     // Example confidence - replace with actual data if available
//     const matchPercentage = `${recognizedFood[0]?.kcal > 100 ? 92 : 85}%`; // Dummy logic

//     return (
//       <SafeAreaView style={styles.safeArea}>
//         {renderStateIndicator()}
//         <View style={styles.resultsContainer}>
//            {/* Header */}
//           <View style={styles.resultsHeader}>
//             <TouchableOpacity onPress={handleRetake} style={styles.backButton}>
//                 <Ionicons name="arrow-back" size={24} color="white" />
//             </TouchableOpacity>
//             <Text style={styles.resultsTitle}>Analysis Results</Text>
//              {/* Spacer to center title */}
//             <View style={{ width: 24 }}/>
//           </View>

//           <ScrollView style={styles.resultsScrollView}>
//             {/* Result Card */}
//             <View style={styles.resultsCard}>
//               {/* Image requires capturedImage to exist */}
//               {capturedImage && <Image source={{ uri: capturedImage.uri }} style={styles.resultImage} resizeMode="cover" />}

//               <View style={styles.foodMatched}>
//                 <Text style={styles.foodMatchedName}>
//                   {/* Use primary food name, provide fallback */}
//                   {recognizedFood[0]?.name || "Identified Food"}
//                 </Text>
//                 <View style={styles.matchBadge}>
//                   <Text style={styles.matchText}>{matchPercentage} match</Text>
//                 </View>
//               </View>

//               <View style={styles.nutritionSummary}>
//                 <Text style={styles.nutritionLabel}>Total Estimated Calories</Text>
//                 <Text style={styles.caloriesValue}>{Math.round(total.calories)} kcal</Text>

//                 <View style={styles.macrosRow}>
//                   <View style={styles.macroItem}>
//                     <Text style={styles.macroLabel}>Protein</Text>
//                     <Text style={styles.macroValue}>{total.protein.toFixed(1)}g</Text>
//                   </View>
//                   <View style={styles.macroItem}>
//                     <Text style={styles.macroLabel}>Carbs</Text>
//                     <Text style={styles.macroValue}>{total.carbs.toFixed(1)}g</Text>
//                   </View>
//                   <View style={styles.macroItem}>
//                     <Text style={styles.macroLabel}>Fat</Text>
//                     <Text style={styles.macroValue}>{total.fat.toFixed(1)}g</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* Identified Items List */}
//             <View style={styles.identifiedItemsContainer}>
//               <Text style={styles.identifiedItemsTitle}>Identified Items Breakdown</Text>

//               {recognizedFood.map((food: FoodItem, idx: number) => ( // Explicit types for map params
//                 <View key={`${food.name}-${idx}`} style={styles.identifiedItem}>
//                   <View style={styles.itemDetail}>
//                     <Text style={styles.itemName}>{food.name}</Text>
//                     {/* Example portion logic - replace with real data if available */}
//                     {/* <Text style={styles.itemPortion}>Approx. 1 serving</Text> */}
//                   </View>
//                   <Text style={styles.itemCalories}>{food.kcal} cal</Text>
//                 </View>
//               ))}
//             </View>

//             <Text style={styles.disclaimerText}>
//               Nutritional information is estimated based on image recognition. Verify for accuracy.
//             </Text>
//           </ScrollView>

//           {/* Add to Log Button */}
//           <TouchableOpacity style={styles.addToLogButton} onPress={handleAddToFoodLog}>
//             <Ionicons name="add-circle-outline" size={22} color="white" />
//             <Text style={styles.addToLogButtonText}>Add Items to Log</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Fallback for unexpected states or if results array is empty
//    if (captureState === 'results' && (!recognizedFood || recognizedFood.length === 0)) {
//      return (
//        <SafeAreaView style={styles.safeArea}>
//          {renderStateIndicator()}
//          <View style={styles.container}>
//             <Ionicons name="sad-outline" size={40} color="#f97316" style={{ marginBottom: 10 }}/>
//             <Text style={styles.errorText}>Analysis Complete</Text>
//             <Text style={styles.errorSubText}>Could not identify food items in the image.</Text>
//             <TouchableOpacity style={styles.button} onPress={handleRetake}>
//               <Text style={styles.buttonText}>Try Again</Text>
//             </TouchableOpacity>
//          </View>
//        </SafeAreaView>
//      );
//    }


//   // General Fallback for any other unexpected state
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {renderStateIndicator()}
//       <View style={styles.container}>
//         <Text style={styles.errorText}>An unexpected error occurred.</Text>
//          <TouchableOpacity style={styles.button} onPress={handleRetake}>
//             <Text style={styles.buttonText}>Start Over</Text>
//          </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// } // End of component

// // --- STYLES ---
// // (Using Dimensions requires it to be defined outside the component scope)
// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // Light grey background
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   // State indicator styles
//   stateIndicator: {
//     backgroundColor: '#ffffff', // White background for indicator bar
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0', // Light border
//   },
//   stateTitle: {
//     fontSize: 12, // Smaller title
//     fontWeight: '600', // Semibold
//     color: '#64748b', // Muted color
//     marginBottom: 6,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   stateTabs: {
//     flexDirection: 'row',
//     justifyContent: 'space-around', // Space out tabs
//   },
//   stateTab: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 15, // Pill shape
//     borderWidth: 1,
//     borderColor: 'transparent', // No border by default
//   },
//   activeStateTab: {
//     backgroundColor: '#e0f2fe', // Light blue background for active
//     borderColor: '#7dd3fc', // Blue border for active
//   },
//   stateTabText: {
//     fontSize: 13,
//     color: '#475569', // Darker muted text
//     fontWeight: '500',
//   },
//   activeStateTabText: {
//     color: '#0c4a6e', // Dark blue text for active
//     fontWeight: '600',
//   },

//   // Camera screen styles (instructional state)
//   cameraContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // Match safe area background
//     alignItems: 'center', // Center content vertically
//     justifyContent: 'center', // Center content horizontally
//     padding: 20,
//   },
//    cameraInstructionContent: {
//      alignItems: 'center',
//      maxWidth: 350,
//    },
//    backButton: { // General back button style
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     zIndex: 10,
//     padding: 5, // Add padding for easier tap target
//   },
//   cameraTitle: { // Title for camera instruction screen
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1e293b', // Dark text
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   cameraSubtitle: { // Subtitle for camera instruction screen
//     fontSize: 16,
//     color: '#64748b', // Muted color
//     textAlign: 'center',
//     marginBottom: 40,
//     lineHeight: 24,
//   },
//   bigLaunchButton: { // Button to launch external camera
//     backgroundColor: '#3b82f6', // Blue
//     paddingVertical: 16,
//     paddingHorizontal: 30,
//     borderRadius: 30, // Rounded pill shape
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   bigLaunchButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600', // Semibold
//   },


//   // Preview screen styles
//   previewContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // Light background
//   },
//   previewHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//     backgroundColor: '#ffffff', // White header background
//   },
//   previewTitle: {
//     fontSize: 18,
//     fontWeight: '600', // Semibold
//     color: '#1e293b',
//   },
//   previewImage: {
//     flex: 1, // Take available space
//     margin: 16,
//     borderRadius: 12,
//     backgroundColor: '#e2e8f0', // Placeholder bg
//   },
//   previewControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//     backgroundColor: '#ffffff', // White controls background
//   },
//   retakeButton: { // Consistent button style
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ffffff', // White background
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#cbd5e1', // Gray border
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   retakeButtonText: {
//     color: '#374151', // Dark gray text
//     marginLeft: 8,
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   analyzeButton: { // Consistent button style
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#3b82f6', // Blue background
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   analyzeButtonText: {
//     color: 'white',
//     // marginRight: 8, // Icon now on left
//     fontWeight: '600',
//     fontSize: 16,
//   },

//   // Analyzing screen styles
//   analyzingContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // Light background
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center', // Center the content box
//   },
//   analyzingContent: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 30, // More padding
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 }, // More shadow
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//     width: '90%', // Limit width
//     maxWidth: 400,
//   },
//   loaderCircle: {
//     width: 72, // Larger circle
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#e0f2fe', // Lighter blue
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   analyzingTitle: {
//     fontSize: 22, // Larger title
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 12,
//     color: '#1e293b',
//   },
//   analyzingSubtitle: {
//     fontSize: 15, // Slightly larger subtitle
//     textAlign: 'center',
//     color: '#64748b',
//     marginBottom: 30, // More margin
//     lineHeight: 22,
//   },
//   progressBarContainer: {
//     width: '100%',
//     height: 10, // Thicker bar
//     backgroundColor: '#e2e8f0',
//     borderRadius: 5,
//     overflow: 'hidden',
//     marginBottom: 20, // More margin
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#3b82f6', // Blue progress
//     borderRadius: 5,
//   },
//   analyzingTimeEstimate: { // Removed in render, keep style if needed later
//     fontSize: 14,
//     color: '#94a3b8',
//   },

//   // Results screen styles
//   resultsContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // Match safe area background
//   },
//   resultsHeader: {
//     backgroundColor: '#3b82f6', // Blue header
//     paddingVertical: 12, // Adjusted padding
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between', // Space out items
//   },
//   resultsTitle: {
//     color: 'white',
//     fontSize: 20, // Slightly larger title
//     fontWeight: 'bold',
//     textAlign: 'center', // Center title if needed (adjust layout)
//      flex: 1, // Allow title to take space for centering between buttons
//   },
//   resultsScrollView: {
//     flex: 1,
//   },
//   resultsCard: {
//     backgroundColor: 'white',
//     margin: 16,
//     borderRadius: 12,
//     overflow: 'hidden', // Clip image corners
//     shadowColor: '#9ca3af', // Muted shadow color
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   resultImage: {
//     width: '100%',
//     height: 220, // Larger image
//     backgroundColor: '#e2e8f0',
//   },
//   foodMatched: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: '#f1f5f9', // Very light grey background
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   foodMatchedName: {
//     color: '#1e293b', // Dark text
//     fontSize: 18, // Larger name
//     fontWeight: '600', // Semibold
//     flex: 1, // Allow text to wrap if long
//     marginRight: 10,
//   },
//   matchBadge: {
//     backgroundColor: '#16a34a', // Darker green
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 15, // Pill shape
//   },
//   matchText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   nutritionSummary: {
//     padding: 16,
//   },
//   nutritionLabel: {
//     fontSize: 14,
//     color: '#64748b', // Muted label color
//     marginBottom: 4,
//   },
//   caloriesValue: {
//     fontSize: 32, // Large calorie display
//     fontWeight: 'bold',
//     color: '#1e293b',
//     marginBottom: 16,
//   },
//   macrosRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9', // Light separator
//     paddingTop: 16,
//   },
//   macroItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   macroLabel: {
//     fontSize: 13, // Smaller label
//     color: '#64748b',
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   macroValue: {
//     fontSize: 18, // Larger macro value
//     fontWeight: '600',
//     color: '#334155', // Darker gray
//   },
//   identifiedItemsContainer: {
//     backgroundColor: 'white',
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#9ca3af',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   identifiedItemsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   identifiedItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14, // More padding
//     paddingHorizontal: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9', // Very light separator
//   },
//   itemDetail: {
//     flex: 1, // Allow text to take space
//     marginRight: 10,
//   },
//   itemName: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#334155',
//   },
//   itemPortion: { // Style for portion text if you add it
//     fontSize: 13,
//     color: '#64748b',
//     marginTop: 2,
//   },
//   itemCalories: {
//     fontSize: 15,
//     fontWeight: '600', // Bolder calories
//     color: '#0ea5e9', // Blueish color for calories
//   },
//   disclaimerText: {
//     fontSize: 12,
//     color: '#64748b', // Muted color
//     textAlign: 'center',
//     marginHorizontal: 24, // More horizontal margin
//     marginBottom: 24,
//     lineHeight: 18,
//   },
//   addToLogButton: { // Add to log button style
//     backgroundColor: '#16a34a', // Green color
//     marginHorizontal: 16,
//     marginBottom: Platform.OS === 'ios' ? 25 : 16, // More bottom margin on iOS
//     marginTop: 8, // Add some space above
//     borderRadius: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 16, // Taller button
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   addToLogButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//     marginLeft: 10,
//   },

//   // General/Fallback styles
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f8fafc',
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc', // Match background
//   },
//   loaderText: {
//     marginTop: 15, // More space
//     color: '#64748b',
//     fontSize: 16, // Larger text
//   },
//   errorText: { // For permission denied / fallback
//     fontSize: 18, // Larger text
//     fontWeight: '600', // Semibold
//     color: '#334155', // Darker text
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   errorSubText: { // Subtext for errors
//       fontSize: 14,
//       color: '#64748b',
//       textAlign: 'center',
//       marginBottom: 25,
//       lineHeight: 20,
//       paddingHorizontal: 10,
//   },
//   button: { // General purpose button (e.g., Go Back)
//     backgroundColor: '#3b82f6',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   buttonText: { // Text for general button
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });