import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MealCard({ meal, totalCalories, nutrients, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);
  
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.timeItemContainer}>
                <Ionicons name="time-outline" size={14} style={styles.clockIcon} color="#9CA3AF" />
                <Text style={styles.timeText}>{meal.time}</Text>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.itemsText}>
                  {meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>
            
            <View style={styles.caloriesContainer}>
              <Text style={styles.calories}>{totalCalories} kcal</Text>
              <TouchableOpacity 
                onPress={() => setShowOptions(!showOptions)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              {showOptions && (
                <View style={styles.optionsMenu}>
                  <TouchableOpacity style={styles.optionButton} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={16} color="#9CA3AF" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.macrosGrid}>
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{nutrients.protein} g</Text>
            </View>
            
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{nutrients.carbs} g</Text>
            </View>
            
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{nutrients.fat} g</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827', // gray-900
    padding: 1,
    borderRadius: 12,
  },
  cardContainer: {
    backgroundColor: '#1F2937', // gray-800
    borderRadius: 8,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#F97316', // orange-500
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timeItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
  },
  bulletPoint: {
    marginHorizontal: 8,
    color: '#9CA3AF', // gray-400
    fontSize: 14,
  },
  itemsText: {
    fontSize: 14,
    color: '#9CA3AF', // gray-400
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  calories: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F43F5E', // rose-500
    marginRight: 8,
  },
  optionsMenu: {
    position: 'absolute',
    right: 0,
    top: 25,
    width: 120,
    backgroundColor: '#374151', // gray-700
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    color: '#D1D5DB', // gray-300
    fontSize: 14,
  },
  macrosGrid: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: '#374151', // gray-700
    borderRadius: 8,
    padding: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 12,
    color: '#9CA3AF', // gray-400
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});