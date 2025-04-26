// components/common/PermissionDeniedView.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PermissionDeniedViewProps {
    onGrantPermission: () => void;
    onGoBack: () => void;
}

export const PermissionDeniedView: React.FC<PermissionDeniedViewProps> = ({ onGrantPermission, onGoBack }) => (
    <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" style={{ marginBottom: 10 }}/>
        <Text style={styles.errorText}>Camera Permission Required</Text>
        <Text style={styles.errorSubText}>Please grant camera permission in your device settings or press below.</Text>
        {/* Button from react-native requires onPress and title */}
        <View style={{marginBottom: 15}}>
             <Button onPress={onGrantPermission} title="Grant Permission"/>
        </View>
        <TouchableOpacity style={styles.button} onPress={onGoBack}>
            <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
    errorText: { fontSize: 18, fontWeight: '600', color: '#334155', textAlign: 'center', marginBottom: 10 },
    errorSubText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 25, lineHeight: 20, paddingHorizontal: 10 },
    button: { backgroundColor: '#64748b', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }, // Secondary color
    buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});