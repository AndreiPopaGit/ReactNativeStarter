// --- START OF FILE components/foodScanner/ResultsView.tsx ---
// PART 2 of 3

import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform // <<< Make sure Platform is imported
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem } from '../../types'; // <<< Adjust path to your types file

interface ResultsViewProps {
    imageUri?: string; // Image is optional (might fail to capture/save)
    foodData: FoodItem[]; // Expecting a non-empty array here based on parent logic
    onAddToLog: () => void;
    onRetake: () => void; // <<< Added prop for "Scan Again" action
}

// Helper function to calculate totals from the food items
const calculateTotalNutrition = (foods: FoodItem[]): { calories: number; protein: number; carbs: number; fat: number } => {
    return foods.reduce(
      (totals, f) => ({
        calories: totals.calories + (Number(f.kcal) || 0), // Ensure calculation is numeric
        protein: totals.protein + (Number(f.protein) || 0),
        carbs: totals.carbs + (Number(f.carbs) || 0),
        fat: totals.fat + (Number(f.fats) || 0), // Use 'fats' property
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 } // Initial accumulator
    );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ imageUri, foodData, onAddToLog, onRetake }) => {
    // Calculate totals only if foodData is valid
    const total = foodData.length > 0 ? calculateTotalNutrition(foodData) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const matchPercentage = "92%"; // Example - replace with real data if available

    return (
        // Use flex: 1 to allow ScrollView and buttons to position correctly
        <View style={styles.resultsContainer}>
            {/* Removed header from here - handled by screen component potentially */}

            <ScrollView style={styles.resultsScrollView}>
                {/* Results Card */}
                <View style={styles.resultsCard}>
                    {imageUri ? (
                         <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
                     ) : (
                         // Optional: Placeholder if imageUri is missing
                         <View style={[styles.resultImage, styles.imagePlaceholder]}>
                             <Ionicons name="image-outline" size={50} color="#cbd5e1"/>
                         </View>
                     )}


                    <View style={styles.foodMatched}>
                        <Text style={styles.foodMatchedName} numberOfLines={1} ellipsizeMode="tail">
                            {/* Provide default if name somehow missing */}
                            {foodData[0]?.name || "Identified Food"}
                        </Text>
                        {/* Only show badge if relevant */}
                        {/* <View style={styles.matchBadge}>
                            <Text style={styles.matchText}>{matchPercentage} match</Text>
                        </View> */}
                    </View>

                    <View style={styles.nutritionSummary}>
                        <Text style={styles.nutritionLabel}>Total Estimated Calories</Text>
                        <Text style={styles.caloriesValue}>{Math.round(total.calories)} kcal</Text>

                        <View style={styles.macrosRow}>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Protein</Text>
                                <Text style={styles.macroValue}>{total.protein.toFixed(1)}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Carbs</Text>
                                <Text style={styles.macroValue}>{total.carbs.toFixed(1)}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Fat</Text>
                                <Text style={styles.macroValue}>{total.fat.toFixed(1)}g</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Identified Items List */}
                <View style={styles.identifiedItemsContainer}>
                    <Text style={styles.identifiedItemsTitle}>Identified Items Breakdown</Text>
                    {foodData.map((food, idx) => (
                        <View key={`${food.name}-${idx}-${food.kcal}`} style={styles.identifiedItem}>
                            <View style={styles.itemDetail}>
                                <Text style={styles.itemName}>{food.name || 'Unknown Item'}</Text>
                            </View>
                            <Text style={styles.itemCalories}>{food.kcal || 0} cal</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.disclaimerText}>
                    Nutritional information is estimated based on image recognition. Verify for accuracy.
                </Text>
                 {/* Add some padding at the bottom of scroll view */}
                 <View style={{ height: 20 }} />
            </ScrollView>

            {/* Action Buttons Container */}
            <View style={styles.resultsActionsContainer}>
                 {/* "Scan Again" Button */}
                 <TouchableOpacity style={[styles.actionButton, styles.retakeButton]} onPress={onRetake}>
                     <Ionicons name="refresh-outline" size={20} color="#3b82f6" />
                     <Text style={styles.retakeButtonText}>Scan Again</Text>
                 </TouchableOpacity>

                 {/* "Add to Log" Button */}
                <TouchableOpacity style={[styles.actionButton, styles.addToLogButton]} onPress={onAddToLog}>
                    <Ionicons name="add-circle-outline" size={22} color="white" />
                    <Text style={styles.addToLogButtonText}>Add to Log</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- STYLES ---
// (Includes styles for the new action buttons container and retake button)
const styles = StyleSheet.create({
    resultsContainer: {
        flex: 1, // Need flex: 1 for layout
        backgroundColor: '#f8fafc',
    },
    resultsScrollView: {
        flex: 1, // Allow scroll view to take up space above buttons
    },
    resultsCard: { backgroundColor: 'white', margin: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
    resultImage: { width: '100%', height: 220, backgroundColor: '#e2e8f0' },
    imagePlaceholder: { justifyContent: 'center', alignItems: 'center'}, // Style for placeholder
    foodMatched: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    foodMatchedName: { color: '#1e293b', fontSize: 18, fontWeight: '600', flex: 1, marginRight: 10 },
    matchBadge: { backgroundColor: '#16a34a', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
    matchText: { color: 'white', fontSize: 12, fontWeight: '600' },
    nutritionSummary: { padding: 16 },
    nutritionLabel: { fontSize: 14, color: '#64748b', marginBottom: 4 },
    caloriesValue: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    macrosRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    macroItem: { alignItems: 'center', flex: 1 },
    macroLabel: { fontSize: 13, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    macroValue: { fontSize: 18, fontWeight: '600', color: '#334155' },
    identifiedItemsContainer: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
    identifiedItemsTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    identifiedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    itemDetail: { flex: 1, marginRight: 10 },
    itemName: { fontSize: 15, fontWeight: '500', color: '#334155' },
    itemCalories: { fontSize: 15, fontWeight: '600', color: '#0ea5e9' },
    disclaimerText: { fontSize: 12, color: '#64748b', textAlign: 'center', marginHorizontal: 24, marginBottom: 10, lineHeight: 18 }, // Reduced bottom margin

    // Styles for the bottom action buttons
    resultsActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space buttons evenly
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // Light separator line
        backgroundColor: '#ffffff', // White background for button area
        paddingBottom: Platform.OS === 'ios' ? 30 : 16, // Extra padding for iOS home indicator
    },
    actionButton: { // Common style for both buttons
        flex: 1, // Make buttons share width
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14, // Button height
        borderRadius: 8,
        marginHorizontal: 6, // Space between buttons
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    retakeButton: { // Specific style for "Scan Again"
        backgroundColor: '#ffffff', // White background
        borderWidth: 1,
        borderColor: '#cbd5e1', // Gray border
    },
    retakeButtonText: {
        color: '#3b82f6', // Blue text
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    addToLogButton: { // Specific style for "Add to Log"
        backgroundColor: '#16a34a', // Green color
    },
    addToLogButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});
// --- END OF FILE components/foodScanner/ResultsView.tsx ---
// --- END OF PART 2 ---