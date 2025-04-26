export const getDailyTotals = (meals = []) => { // Add default empty array for robustness
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  // Check if meals is actually an array before iterating
  if (!Array.isArray(meals)) {
    console.error("getDailyTotals received non-array input:", meals);
    // Return default zero values if input is invalid
    return { calories: 0, carbs: 0, protein: 0, fat: 0 };
  }

  meals.forEach((meal) => {
    // Check if meal.foods exists and is an array before iterating
    if (meal && Array.isArray(meal.foods)) {
      meal.foods.forEach((food) => {
        // Check if food is a valid object before accessing properties
        if (food && typeof food === 'object') {
          // --- FIX: Check for both property names and ensure numeric ---
          totalCalories += Number(food.calories || food.kcal) || 0;
          totalCarbs += Number(food.carbs) || 0; // Assuming carbs name is consistent
          totalProtein += Number(food.protein) || 0; // Assuming protein name is consistent
          totalFat += Number(food.fat || food.fats) || 0;
          // --- End of FIX ---
        } else {
            console.warn("Invalid food item found in meal:", meal.id, food);
        }
      });
    } else {
        console.warn("Meal found without valid foods array:", meal?.id);
    }
  });

  // Round the final totals
  return {
    calories: Math.round(totalCalories),
    carbs: Math.round(totalCarbs), // Consider toFixed(1) if you need decimals
    protein: Math.round(totalProtein), // Consider toFixed(1)
    fat: Math.round(totalFat), // Consider toFixed(1)
  };
};