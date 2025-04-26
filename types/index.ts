// types/index.ts (or types/food.ts)
export interface FoodItem {
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    // Add other properties if your API returns more
  }
  
  // You might also define the Meal interface here if used elsewhere
  export interface MealFoodItem extends FoodItem {
     id: string;
     quantity: number;
  }
  export interface Meal {
     id: string;
     name: string;
     time: string;
     foods: MealFoodItem[]; // Use the extended type if needed, otherwise FoodItem[]
  }