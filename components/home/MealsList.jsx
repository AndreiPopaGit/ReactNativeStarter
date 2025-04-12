import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MealCard from './MealCard';

export default function MealsList({
  meals = [],
  onMealPress,
  calculateMealCalories,
  calculateMealNutrients,
  emptyStateComponent,
}) {
  // If no meals, render an optional empty state from parent or a simple fallback
  if (meals.length === 0) {
    return emptyStateComponent || null;
  }

  return (
    <View>
      {meals.map((meal) => {
        const totalCalories = calculateMealCalories(meal.foods);
        const nutrients = calculateMealNutrients(meal.foods);

        return (
          <TouchableOpacity
            key={meal.id}
            style={{ marginBottom: 16 }}
            onPress={() => onMealPress(meal)}
            activeOpacity={0.7}
          >
            <MealCard
              meal={meal}
              totalCalories={totalCalories}
              nutrients={nutrients}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
