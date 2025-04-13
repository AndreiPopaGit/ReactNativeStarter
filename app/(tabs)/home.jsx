import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1) Import your custom hook (loads and saves AsyncStorage data)
import useFoodStorage from '../../lib/useFoodStorage';
import { getDailyTotals } from '../../lib/calculateTotalsNutritionTracker'

// 2) Import your existing components
import Header from '../../components/home/Header';
import NutritionTracker from '../../components/home/NutritionTracker';
import MealsList from '../../components/home/MealsList';
import MealModal from '../../components/home/MealModal';
import AddFoodModal from '../../components/home/AddFoodModal';

export default function Home() {
  // ------------------
  //   Use Hook
  // ------------------
  const {
    foodDatabase,              // your array from AsyncStorage
    meals,                     // today's meals
    setMeals,
    saveTodayMealsToStorage,   // call this whenever we modify 'meals'
  } = useFoodStorage();

  // ------------------
  //   Local State
  // ------------------
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isNewMeal, setIsNewMeal] = useState(false);

  // Modals
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);

  // For new meal name/time
  const [newMealName, setNewMealName] = useState('');
  const [newMealTime, setNewMealTime] = useState('');

  // For editing quantity
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState('');

  // For the add-food search
  const [searchQuery, setSearchQuery] = useState('');

  // ------------------
  //   Helper Functions
  // ------------------

  // Calculate total calories for a meal
  const calculateMealCalories = (foods) => {
    return Math.round(foods.reduce((total, f) => total + f.calories, 0));
  };

  // Calculate total nutrients for a meal
  const calculateMealNutrients = (foods) => {
    return foods.reduce(
      (acc, f) => ({
        protein: Math.round(acc.protein + f.protein),
        carbs: Math.round(acc.carbs + f.carbs),
        fat: Math.round(acc.fat + f.fat),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  // ------------------
  //   Event Handlers
  // ------------------

  // Click an existing meal card
  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setIsNewMeal(false);
    setMealModalVisible(true);
  };

  // Create a new meal
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

  // Save new or edited meal
  const saveMeal = () => {
    if (!selectedMeal) return;

    if (isNewMeal) {
      // Merge changed name/time
      const mealToSave = {
        ...selectedMeal,
        name: newMealName || selectedMeal.name,
        time: newMealTime || selectedMeal.time,
      };
      const updatedMeals = [...meals, mealToSave];
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }
    // If not new, we just close the modal
    setMealModalVisible(false);
    setSelectedMeal(null);
    setIsNewMeal(false);
  };

  // Close meal modal
  const closeMealModal = () => {
    if (isNewMeal) {
      setSelectedMeal(null);
      setIsNewMeal(false);
    }
    setMealModalVisible(false);
  };

  // Start editing a quantity
  const startEditingQuantity = (foodId, currentQuantity) => {
    setEditingFoodId(foodId);
    setEditingQuantity(currentQuantity.toString());
  };

  // Save changed quantity
  const saveQuantity = (mealId, foodId) => {
    if (!selectedMeal) return;

    const updatedFoods = selectedMeal.foods.map((food) => {
      if (food.id === foodId) {
        const newQuantity = parseFloat(editingQuantity) || 0;
        // find the matching item in your loaded 'foodDatabase'
        const foodDbItem = foodDatabase.find((f) => f.id === food.id);

        if (foodDbItem) {
          // Adjust macros based on new quantity
          const factor = newQuantity / 100;
          return {
            ...food,
            quantity: newQuantity,
            calories: Math.round(foodDbItem.kcal * factor),        // note your keys might be 'kcal'
            protein: Math.round(foodDbItem.protein * factor * 10) / 10,
            carbs: Math.round(foodDbItem.carbs * factor * 10) / 10,
            fat: Math.round(foodDbItem.fats * factor * 10) / 10,   // if your key is 'fats', etc.
          };
        }
        // If not found in DB, just update quantity
        return { ...food, quantity: newQuantity };
      }
      return food;
    });

    const updatedMeal = { ...selectedMeal, foods: updatedFoods };
    setSelectedMeal(updatedMeal);

    // If it's existing meal, also update in the main meals array
    if (!isNewMeal) {
      const updatedMeals = meals.map((m) =>
        m.id === mealId ? updatedMeal : m
      );
      setMeals(updatedMeals);
      saveTodayMealsToStorage(updatedMeals);
    }

    setEditingFoodId(null);
  };

  // Remove a food item from a meal
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

  // Open add-food modal
  const openAddFoodModal = () => {
    setAddFoodModalVisible(true);
    setSearchQuery('');
  };

  // Filter for your add-food search
  const filteredFoods = foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add a selected food from DB to current meal
  const addFoodToMeal = (foodItem) => {
    if (!selectedMeal) return;

    const quantity = 100;
    const factor = quantity / 100;

    // Adjust your keys to match your actual foodDatabase shape
    const newFood = {
      id: foodItem.id,
      name: foodItem.name,
      quantity,
      calories: Math.round(foodItem.kcal * factor),
      protein: Math.round(foodItem.protein * factor * 10) / 10,
      carbs: Math.round(foodItem.carbs * factor * 10) / 10,
      fat: Math.round(foodItem.fats * factor * 10) / 10,
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

  // ------------------
  //   RENDER
  // ------------------

  return (
    <View style={styles.safeArea}>
      <Header title="Andrei" subtitle={new Date().toDateString()} />
     
      {/* For now, you might compute daily totals or pass mock goals */}
      <NutritionTracker
        // You can compute totals from 'meals' if you'd like
        // for now, just pass some props or do dynamic logic
        caloriesConsumed={calories}
        calorieGoal={2000}
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

      {/* MealModal */}
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

      {/* AddFoodModal */}
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
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    color: '#333',
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
