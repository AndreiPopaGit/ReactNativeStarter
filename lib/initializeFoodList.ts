import AsyncStorage from '@react-native-async-storage/async-storage';
import  foodList  from './foodData'; // Adjust path if needed

const FOOD_LIST_KEY = 'foodList';
const FOOD_LIST_VERSION = '1.0.0';

export const initializeFoodList = async () => {
    try {
    //   console.log('📦 Food list:', foodList);
      const existingVersion = await AsyncStorage.getItem('foodListVersion');
      if (existingVersion === FOOD_LIST_VERSION) {
        console.log('✅ Food list already initialized');
        return;
      }
  
      await AsyncStorage.setItem(FOOD_LIST_KEY, JSON.stringify(foodList));
      await AsyncStorage.setItem('foodListVersion', FOOD_LIST_VERSION);
      console.log('✅ Food list initialized and saved');

      const testStored = await AsyncStorage.getItem(FOOD_LIST_KEY);
      console.log('🔍 What’s actually in storage:', testStored);
    } catch (error) {
      console.error('❌ Failed to initialize food list:', error);
    }
  };
