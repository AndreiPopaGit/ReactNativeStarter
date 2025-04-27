import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TODAY_MEALS_KEY = 'todayMeals';

export default function Profile() {
  const { session } = useAuth();
  const router = useRouter();

  if (!session) return null;

  /* ---------- helpers ---------- */

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const showStorageContents = async () => {
    const keys = await AsyncStorage.getAllKeys();
    console.log('🔑 Keys:', keys);
  
    const entries = await AsyncStorage.multiGet(keys);
    console.log('🧠 AsyncStorage Contents:');
    entries.forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  };

  const clearTodayMeals = async () => {
    try {
      await AsyncStorage.setItem(TODAY_MEALS_KEY, '[]');  // keep the key, empty the value
      console.log('✅ todayMeals reset to empty array');
      Alert.alert('Success', 'Today’s meals have been cleared.');
    } catch (err) {
      console.error('Failed to clear todayMeals', err);
      Alert.alert('Error', 'Could not clear today’s meals.');
    }
  };

  /* ---------- UI ---------- */

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ marginBottom: 16 }}>
        Logged in as: {session.user.email}
      </Text>

      <Button title="Sign Out"     onPress={handleSignOut}      />

      <Button
        title="Show Async Storage"
        type="outline"
        containerStyle={{ marginTop: 12 }}
        onPress={showStorageContents}
      />

      <Button
        title="Clear Today’s Meals"
        type="outline"
        containerStyle={{ marginTop: 12 }}
        onPress={() =>
          Alert.alert(
            'Clear all meals?',
            'This will remove every meal logged for today. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear',  style: 'destructive', onPress: clearTodayMeals },
            ]
          )
        }
      />

      <Button
        title="Reset Food Init"
        type="outline"
        containerStyle={{ marginTop: 12 }}
        onPress={async () => {
          await AsyncStorage.removeItem('foodListVersion');
          console.log('🔄 Food list version flag removed');
        }}
      />
    </View>
  );
}
