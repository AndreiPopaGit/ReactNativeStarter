// components/common/PermissionLoadingView.tsx (or similar path)
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const PermissionLoadingView = () => (
    <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loaderText}>Requesting Permissions...</Text>
    </View>
);

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: 15, color: '#64748b', fontSize: 16 },
});