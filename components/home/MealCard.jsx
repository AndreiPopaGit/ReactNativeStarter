import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MealCard({ meal, totalCalories, nutrients }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.items}>
          {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.calories}>{totalCalories} kcal</Text>
      </View>

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
          <Text style={styles.macroValue}>{nutrients.fats}g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  items: {
    fontSize: 12,
    color: '#666',
  },
  calories: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F9FF',
    padding: 8,
    borderRadius: 8,
  },
  macro: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    color: '#555',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
