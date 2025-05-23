import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useFoodStorage from '../../lib/useFoodStorage';
import { getDailyTotals } from '../../lib/calculateTotalsNutritionTracker';

import Header from '../../components/home/Header';
import NutritionTracker from '../../components/home/NutritionTracker';
import MealsList from '../../components/home/MealsList';
import MealModal from '../../components/home/MealModal';
import AddFoodModal from '../../components/home/AddFoodModal';

export default function Home() {

  const GOAL_KEY = 'calorieGoal';
  const route = useRoute();
  const {
    foodDatabase,
    meals,
    setMeals,
    saveTodayMealsToStorage,
  } = useFoodStorage();

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isNewMeal, setIsNewMeal] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealTime, setNewMealTime] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const calculateMealCalories = (foods) => {
    return Math.round(foods.reduce((total, f) => total + (f.calories || 0), 0));
  };

  const calculateMealNutrients = (foods) => {
    return foods.reduce(
      (acc, f) => ({
        protein: Math.round(acc.protein + (f.protein || 0)),
        carbs: Math.round(acc.carbs + (f.carbs || 0)),
        fat: Math.round(acc.fat + (f.fat || 0)),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setIsNewMeal(false);
    setMealModalVisible(true);
  };

  /** Delete a meal entirely */
  const handleDeleteMeal = (mealId) => {
    Alert.alert(
      'Delete meal?',
      'This will remove the meal and all foods inside it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMeals = meals.filter((m) => m.id !== mealId);
            setMeals(updatedMeals);
            saveTodayMealsToStorage(updatedMeals);
          },
        },
      ],
    );
  };

  const handleAddMealPress = () => {
    const timeNow = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setNewMealName('New Meal');
    setNewMealTime(timeNow);

    const newMeal = {
      id: `new-${Date.now()}`,
      name: 'New Meal',
      time: timeNow,
      foods: [],
    };

    setSelectedMeal(newMeal);
    setIsNewMeal(true);
    setMealModalVisible(true);
  };

  const saveMeal = () => {
    if (!selectedMeal) return;

    if (isNewMeal) {
      const mealToSave = {
        ...selectedMeal,
        name: newMealName || selectedMeal.name,
        time: newMealTime || selectedMeal.time,
      };
      const updatedMeals = [...meals, mealToSave];
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }

    setMealModalVisible(false);
    setSelectedMeal(null);
    setIsNewMeal(false);
  };

  const closeMealModal = () => {
    if (isNewMeal) {
      setSelectedMeal(null);
      setIsNewMeal(false);
    }
    setMealModalVisible(false);
  };

  const startEditingQuantity = (foodId, currentQuantity) => {
    setEditingFoodId(foodId);
    setEditingQuantity(currentQuantity.toString());
  };

  const saveQuantity = (mealId, foodId) => {
    if (!selectedMeal) return;

    const updatedFoods = selectedMeal.foods.map((food) => {
      if (food.id === foodId) {
        const newQuantity = parseFloat(editingQuantity) || 0;
        const foodDbItem = foodDatabase.find((f) => f.id === food.id);
        if (foodDbItem) {
          const factor = newQuantity / 100;
          return {
            ...food,
            quantity: newQuantity,
            calories: Math.round(foodDbItem.kcal * factor),
            protein: Math.round(foodDbItem.protein * factor * 10) / 10,
            carbs: Math.round(foodDbItem.carbs * factor * 10) / 10,
            fat: Math.round(foodDbItem.fat * factor * 10) / 10,
          };
        }
        return { ...food, quantity: newQuantity };
      }
      return food;
    });

    const updatedMeal = { ...selectedMeal, foods: updatedFoods };
    setSelectedMeal(updatedMeal);

    if (!isNewMeal) {
      const updatedMeals = meals.map((m) =>
        m.id === mealId ? updatedMeal : m
      );
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }

    setEditingFoodId(null);
  };

  const removeFood = (mealId, foodId) => {
    if (!selectedMeal) return;

    const updatedFoods = selectedMeal.foods.filter((food) => food.id !== foodId);
    const updatedMeal = { ...selectedMeal, foods: updatedFoods };
    setSelectedMeal(updatedMeal);

    if (!isNewMeal) {
      const updatedMeals = meals.map((m) =>
        m.id === mealId ? updatedMeal : m
      );
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }
  };

  const openAddFoodModal = () => {
    setAddFoodModalVisible(true);
    setSearchQuery('');
  };

  const filteredFoods = foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFoodToMeal = (foodItem) => {
    if (!selectedMeal) return;

    const quantity = 100;
    const factor = quantity / 100;

    const newFood = {
      id: foodItem.id,
      name: foodItem.name,
      quantity,
      calories: Math.round(foodItem.kcal * factor),
      protein: Math.round(foodItem.protein * factor * 10) / 10,
      carbs: Math.round(foodItem.carbs * factor * 10) / 10,
      fat: Math.round(foodItem.fat * factor * 10) / 10,
    };

    const updatedFoods = [...selectedMeal.foods, newFood];
    const updatedMeal = { ...selectedMeal, foods: updatedFoods };
    setSelectedMeal(updatedMeal);

    if (!isNewMeal) {
      const updatedMeals = meals.map((m) =>
        m.id === selectedMeal.id ? updatedMeal : m
      );
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }

    setAddFoodModalVisible(false);
  };

  const { calories, carbs, protein, fat } = getDailyTotals(meals);

  useFocusEffect(
    useCallback(() => {
      const loadMeals = async () => {
        try {
          const storedMeals = await AsyncStorage.getItem('todayMeals');
          if (storedMeals) {
            setMeals(JSON.parse(storedMeals));
          }
        } catch (error) {
          console.error('Error loading meals:', error);
        }
      };

      loadMeals();

      /* load calorie goal every time Home gains focus */
      const loadGoal = async () => {
        try {
          const stored = await AsyncStorage.getItem(GOAL_KEY);
          if (stored) setCalorieGoal(parseInt(stored, 10));
        } catch (e) {
          console.error('Error loading calorie goal', e);
        }
      };
      loadGoal();
    }, [route.params?.mealsUpdated]) // listens for updates
  );

  return (
    <View style={styles.safeArea}>
      <Header title="Andrei" subtitle={new Date().toDateString()} />

      <NutritionTracker
        caloriesConsumed={calories}
        calorieGoal={calorieGoal}
        carbsConsumed={carbs}
        carbGoal={250}
        proteinConsumed={protein}
        proteinGoal={120}
        fatConsumed={fat}
        fatGoal={70}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMealPress}>
          <Ionicons name="add-circle" size={30} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <MealsList
          meals={meals}
          onMealPress={handleMealPress}
          onMealDelete={handleDeleteMeal}
          calculateMealCalories={calculateMealCalories}
          calculateMealNutrients={calculateMealNutrients}
          emptyStateComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meals added yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddMealPress}
              >
                <Text style={styles.emptyStateButtonText}>Add Your First Meal</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>

      <MealModal
        visible={mealModalVisible}
        selectedMeal={selectedMeal}
        isNewMeal={isNewMeal}
        newMealName={newMealName}
        setNewMealName={setNewMealName}
        newMealTime={newMealTime}
        setNewMealTime={setNewMealTime}
        closeMealModal={closeMealModal}
        saveMeal={saveMeal}
        startEditingQuantity={startEditingQuantity}
        editingFoodId={editingFoodId}
        editingQuantity={editingQuantity}
        setEditingQuantity={setEditingQuantity}
        saveQuantity={saveQuantity}
        removeFood={removeFood}
        openAddFoodModal={openAddFoodModal}
      />

      <AddFoodModal
        visible={addFoodModalVisible}
        onClose={() => setAddFoodModalVisible(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredFoods={filteredFoods}
        addFoodToMeal={addFoodToMeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827'
  },
  contentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
