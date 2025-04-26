import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorFallbackViewProps {
    message: string;
    onRetry: () => void;
    retryLabel?: string;
}

export const ErrorFallbackView: React.FC<ErrorFallbackViewProps> = ({ message, onRetry, retryLabel = "Start Over" }) => (
     <View style={styles.container}>
        <Ionicons name="warning-outline" size={40} color="#f97316" style={{ marginBottom: 10 }}/>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>{retryLabel}</Text>
         </TouchableOpacity>
     </View>
);

const styles = StyleSheet.create({
     container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
     errorText: { fontSize: 16, color: '#334155', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
     button: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
     buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});