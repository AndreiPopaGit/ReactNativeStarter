// components/camera/CameraInstructionView.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import or define styles needed (e.g., from FoodScannerScreen styles)

interface CameraInstructionViewProps {
  onLaunchCamera: () => void;
}

export const CameraInstructionView: React.FC<CameraInstructionViewProps> = ({ onLaunchCamera }) => (
  <View style={styles.cameraInstructionContent}>
     <Ionicons name="camera-outline" size={80} color="#3b82f6" style={{ marginBottom: 20 }}/>
     <Text style={styles.cameraTitle}>Scan Food Item</Text>
     <Text style={styles.cameraSubtitle}>Press the button below to open the camera...</Text>
     <TouchableOpacity style={styles.bigLaunchButton} onPress={onLaunchCamera}>
       <Ionicons name="camera" size={22} color="#fff" style={{ marginRight: 10 }} />
       <Text style={styles.bigLaunchButtonText}>Launch Camera</Text>
     </TouchableOpacity>
  </View>
);
// Add relevant styles from FoodScannerScreen.styles here or import them
const styles = StyleSheet.create({ 
    cameraInstructionContent: {
        alignItems: 'center',
        maxWidth: 350,
      },
      cameraTitle: { // Title for camera instruction screen
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // Dark text
        textAlign: 'center',
        marginBottom: 8,
      },
      cameraSubtitle: { // Subtitle for camera instruction screen
        fontSize: 16,
        color: '#64748b', // Muted color
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
      },
      bigLaunchButton: { // Button to launch external camera
        backgroundColor: '#3b82f6', // Blue
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 30, // Rounded pill shape
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      },
      bigLaunchButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600', // Semibold
      },
});