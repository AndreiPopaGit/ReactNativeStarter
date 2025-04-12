import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_LIST_KEY = 'foodList';
const TODAY_MEALS_KEY = 'todayMeals';

export default function useFoodStorage() {
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [meals, setMeals] = useState([]);

  // Load both on mount
  useEffect(() => {
    loadFoodListFromStorage();
    loadTodayMealsFromStorage();
  }, []);

  // -- Load the food list --
  const loadFoodListFromStorage = async () => {
    try {
      const storedList = await AsyncStorage.getItem(FOOD_LIST_KEY);
      if (storedList) {
        setFoodDatabase(JSON.parse(storedList));
      } else {
        console.log('No foodList found in AsyncStorage, defaulting to empty or fetch from server...');
      }
    } catch (error) {
      console.error('Failed to load foodList:', error);
    }
  };

  // -- Load today's meals --
  const loadTodayMealsFromStorage = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem(TODAY_MEALS_KEY);
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      } else {
        console.log('No todayMeals found, defaulting to empty array');
        setMeals([]);
      }
    } catch (error) {
      console.error('Failed to load todayMeals:', error);
    }
  };

  // -- Save updated meals to storage --
  const saveTodayMealsToStorage = async (updatedMeals) => {
    try {
      await AsyncStorage.setItem(TODAY_MEALS_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Failed to save todayMeals:', error);
    }
  };

  return {
    foodDatabase,     // array of food items from AsyncStorage
    setFoodDatabase,  // in case you want to manipulate the DB
    meals,            // user's "today meals"
    setMeals,         // in case you want to set meals locally
    loadFoodListFromStorage,
    loadTodayMealsFromStorage,
    saveTodayMealsToStorage,
  };
}
