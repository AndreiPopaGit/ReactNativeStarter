import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TODAY_MEALS_KEY = 'todayMeals';
const USER_PROFILE_KEY = 'userProfile';

export default function Profile() {
  const { session } = useAuth();
  const router = useRouter();
  const {
    recommendedCalorieGoal,
    weight: paramWeight,
    bmi: paramBmi,
    bmiCategory: paramBmiCategory,
  } = useLocalSearchParams();

  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: session?.user?.email ?? 'alex@example.com',
    calorieGoal: 2200,
    weight: 75,
    bmi: 24.5,
    bmiCategory: 'Normal weight',
  });

  const [editingCalories, setEditingCalories] = useState(false);
  const [manualCalories, setManualCalories] = useState('');

  /* ---------------------------------------------------------------- helpers */
  const broadcastGoal = async (goal) => {
    await AsyncStorage.setItem('calorieGoal', goal.toString());
  };

  const saveProfileToStorage = async (profile) => {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('❌ Failed to save profile', err);
    }
  };

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setUserData(parsed);
        setManualCalories(String(parsed.calorieGoal));
      }
    } catch (err) {
      console.error('❌ Failed to load profile', err);
    }
  };

  const showStorageContents = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      console.log('🧠 AsyncStorage Contents');
      entries.forEach(([k, v]) => console.log(`${k}:`, v));
    } catch (err) {
      console.error('❌ Failed to read AsyncStorage', err);
    }
  };

  /* --------------------------------------------- load each time screen gains focus */
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  /* ------------------------ apply query‑string overrides when provided */
  useEffect(() => {
    if (!recommendedCalorieGoal && !paramWeight && !paramBmi) return;

    const updated = { ...userData };
    if (recommendedCalorieGoal) {
      updated.calorieGoal = parseInt(recommendedCalorieGoal, 10);
    }
    if (paramWeight && paramBmi && paramBmiCategory) {
      updated.weight = parseInt(paramWeight, 10);
      updated.bmi = parseFloat(paramBmi);
      updated.bmiCategory = paramBmiCategory;
    }

    setUserData(updated);
    setManualCalories(String(updated.calorieGoal));
    saveProfileToStorage(updated);
    broadcastGoal(updated.calorieGoal);
  }, [recommendedCalorieGoal, paramWeight, paramBmi, paramBmiCategory]);

  /* ---------------- sync email when session changes */
  useEffect(() => {
    if (session?.user?.email) {
      setUserData((prev) => ({ ...prev, email: session.user.email }));
    }
  }, [session]);

  /* ---------------- save manual calorie edits */
  const saveManualCalories = () => {
    const numeric = parseInt(manualCalories, 10) || 0;
    const updatedProfile = { ...userData, calorieGoal: numeric };
    setUserData(updatedProfile);
    setManualCalories(String(numeric));
    saveProfileToStorage(updatedProfile);
    broadcastGoal(numeric);
    setEditingCalories(false);
  };

  /* ---------------- misc actions */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const clearTodayMeals = async () => {
    try {
      await AsyncStorage.setItem(TODAY_MEALS_KEY, '[]');
      Alert.alert('Success', "Today's meals have been cleared.");
    } catch (err) {
      Alert.alert('Error', 'Could not clear today’s meals.');
    }
  };

  const resetFoodInit = async () => {
    await AsyncStorage.removeItem('foodListVersion');
    Alert.alert('Success', 'Food initialisation flag removed.');
  };

  if (!session) return null;

  /* ---------------------------------------------------------------- render */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={36} color="#8B5CF6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Daily Calorie Goal */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="ribbon" size={18} color="#8B5CF6" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Daily Calorie Goal</Text>
            </View>
            {editingCalories ? (
              <TouchableOpacity onPress={saveManualCalories}>
                <Ionicons name="checkmark" size={20} color="#34D399" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditingCalories(true)}>
                <Ionicons name="pencil" size={18} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>

          {editingCalories ? (
            <TextInput
              value={manualCalories}
              onChangeText={setManualCalories}
              keyboardType="numeric"
              style={styles.calorieInput}
              autoFocus
            />
          ) : (
            <Text style={styles.calorieValue}>{userData.calorieGoal} cal</Text>
          )}
        </View>

        {/* Body Stats */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="pulse" size={18} color="#8B5CF6" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Body Stats</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Current Weight</Text>
              <Text style={styles.statValue}>{userData.weight} kg</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>{userData.bmi}</Text>
              <Text style={styles.bmiCategory}>{userData.bmiCategory}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/calculate-goal')}
        >
          <Ionicons name="calculator" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Calculate New Calorie Goal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Dev Tools */}
        <View style={styles.devOptionsContainer}>
          <TouchableOpacity style={styles.devButton} onPress={showStorageContents}>
            <Text style={styles.devButtonText}>Show AsyncStorage Contents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.devButton} onPress={loadProfile}>
            <Text style={styles.devButtonText}>Reload Profile From Storage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.devButton}
            onPress={() =>
              Alert.alert('Clear all meals?', 'This will remove every meal logged for today.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearTodayMeals },
              ])
            }
          >
            <Text style={styles.devButtonText}>Clear Today’s Meals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.devButton} onPress={resetFoodInit}>
            <Text style={styles.devButtonText}>Reset Food Init</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },
  container: { flex: 1, backgroundColor: '#111827' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  profileEmail: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },

  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  calorieValue: { fontSize: 32, fontWeight: '700', color: '#8B5CF6' },
  calorieInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF6',
    paddingVertical: 4,
  },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  bmiCategory: { fontSize: 12, color: '#34D399', marginTop: 2 },

  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonIcon: { marginRight: 8 },

  devOptionsContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  devButton: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  devButtonText: { color: '#E5E7EB', fontSize: 14, textAlign: 'center' },
});
