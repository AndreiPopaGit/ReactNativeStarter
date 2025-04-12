// /components/home/MealCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MealCard({ meal, totalCalories, nutrients }) {
  return (
    <View style={styles.container}>
      {/* Header: meal name & time */}
      <View style={styles.header}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>

      {/* Summary: item count & total cals */}
      <View style={styles.summary}>
        <Text style={styles.items}>
          {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.calories}>{totalCalories} calories</Text>
      </View>

      {/* Macros */}
      <View style={styles.macrosContainer}>
        <View style={styles.macro}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>{nutrients.protein}g</Text>
        </View>
        <View style={styles.macro}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{nutrients.carbs}g</Text>
        </View>
        <View style={styles.macro}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroValue}>{nutrients.fat}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  items: {
    fontSize: 14,
    color: '#666',
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F9FF',
    padding: 10,
    borderRadius: 8,
  },
  macro: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
