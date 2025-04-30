import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalculateGoal() {
  const router = useRouter();
  const USER_PROFILE_KEY = 'userProfile';
  const GOAL_KEY = 'calorieGoal';

  /* ------------------------------------------------------ state */
  const [quizData, setQuizData] = useState({
    gender: 'male',
    age: 30,
    height: 175,          // cm
    weight: 75,           // kg
    activityLevel: 'moderate',
  });

  /* ------------------------------------------------- helpers */
  const calcBMI = () => {
    const h = quizData.height / 100; // m
    return +(quizData.weight / (h * h)).toFixed(1);
  };

  const bmiCategory = (b) =>
    b < 18.5
      ? 'Underweight'
      : b < 25
        ? 'Normal weight'
        : b < 30
          ? 'Overweight'
          : 'Obesity';

  const calculateCalories = () => {
    const { gender, age, height, weight, activityLevel } = quizData;
    const bmr =
      gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    return Math.round(bmr * activityMultipliers[activityLevel]);
  };

  const handleSubmit = async () => {
    const calories = calculateCalories();
    const bmi = calcBMI();
  
    try {
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      let oldProfile = storedProfile ? JSON.parse(storedProfile) : {};
  
      const updatedProfile = {
        ...oldProfile,
        calorieGoal: calories,
        weight: quizData.weight,
        bmi: bmi,
        bmiCategory: bmiCategory(bmi),
      };
  
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
      await AsyncStorage.setItem(GOAL_KEY, calories.toString()); // <- broadcast goal too!
  
      console.log('✅ Updated profile from Calculate Goal');
      router.replace('/profile');
    } catch (err) {
      console.error('❌ Failed to update profile from Calculate Goal', err);
    }
  };

  /* -------------------------------------------------- render */
  return (
    <SafeAreaView style={styles.safe}>
      {/* ---------- header ---------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calorie Goal Calculator</Text>
      </View>

      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
        {/* ---------- gender ---------- */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {['male', 'female'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.pill,
                quizData.gender === g && styles.pillActive,
              ]}
              onPress={() => setQuizData({ ...quizData, gender: g })}
            >
              <Text
                style={[
                  styles.pillText,
                  quizData.gender === g && styles.pillTextActive,
                ]}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------- age / height / weight ---------- */}
        <View style={styles.row}>
          {['Age', 'Height (cm)', 'Weight (kg)'].map((label, idx) => {
            const key = idx === 0 ? 'age' : idx === 1 ? 'height' : 'weight';
            return (
              <View key={key} style={styles.inputWrap}>
                <Text style={styles.labelSmall}>{label}</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(quizData[key])}
                  onChangeText={(v) =>
                    setQuizData({ ...quizData, [key]: parseInt(v, 10) || 0 })
                  }
                  style={styles.input}
                />
              </View>
            );
          })}
        </View>

        {/* ---------- activity ---------- */}
        <Text style={[styles.label, { marginTop: 24 }]}>Activity Level</Text>
        {[
          ['sedentary', 'Sedentary (little to no exercise)'],
          ['light', 'Light (1–3 days/wk)'],
          ['moderate', 'Moderate (3–5 days/wk)'],
          ['active', 'Active (6–7 days/wk)'],
          ['veryActive', 'Very Active (physical job + training)'],
        ].map(([id, text]) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.activityRow,
              quizData.activityLevel === id && styles.activityRowActive,
            ]}
            onPress={() => setQuizData({ ...quizData, activityLevel: id })}
          >
            {quizData.activityLevel === id && (
              <Ionicons
                name="checkmark"
                size={18}
                color="#8B5CF6"
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={[
                styles.activityText,
                quizData.activityLevel === id && styles.activityTextActive,
              ]}
            >
              {text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* ---------- calculate button ---------- */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Ionicons
            name="calculator"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Calculate Calorie Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------------- styles ----------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  container: { flex: 1, padding: 16 },

  /* form */
  label: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  labelSmall: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between' },

  pill: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  pillActive: { backgroundColor: '#4F46E5' },
  pillText: { color: '#E5E7EB' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  inputWrap: { flex: 1, marginRight: 8 },
  input: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityRowActive: { borderColor: '#8B5CF6', borderWidth: 1 },
  activityText: { color: '#E5E7EB', flexShrink: 1 },
  activityTextActive: { color: '#C7D2FE' },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
