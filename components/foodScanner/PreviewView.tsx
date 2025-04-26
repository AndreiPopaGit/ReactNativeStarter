// components/camera/PreviewView.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PreviewViewProps {
    imageUri: string;
    isLoading: boolean;
    onRetake: () => void;
    onAnalyze: () => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ imageUri, isLoading, onRetake, onAnalyze }) => (
   <View style={styles.previewContainer}>
      {/* Preview Header (Optional or simplify) */}
      <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain"/>
      <View style={styles.previewControls}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake} disabled={isLoading}>
           {/* ... Retake Button Content ... */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.analyzeButton} onPress={onAnalyze} disabled={isLoading}>
           {/* ... Analyze Button Content (with ActivityIndicator) ... */}
        </TouchableOpacity>
      </View>
    </View>
);
 // Add relevant styles
const styles = StyleSheet.create({
    previewContainer: {
        flex: 1,
        backgroundColor: '#f8fafc', // Light background
      },
      previewImage: {
        flex: 1, // Take available space
        margin: 16,
        borderRadius: 12,
        backgroundColor: '#e2e8f0', // Placeholder bg
      },
      previewControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#ffffff', // White controls background
      },
      retakeButton: { // Consistent button style
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff', // White background
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1', // Gray border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      analyzeButton: { // Consistent button style
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6', // Blue background
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      },
});