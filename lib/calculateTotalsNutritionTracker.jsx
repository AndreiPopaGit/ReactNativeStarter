export const getDailyTotals = (meals) => {
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
  
    meals.forEach((meal) => {
      meal.foods.forEach((food) => {
        totalCalories += food.calories;
        totalCarbs += food.carbs;
        totalProtein += food.protein;
        totalFat += food.fat;
      });
    });
  
    return {
      calories: Math.round(totalCalories),
      carbs: Math.round(totalCarbs),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
    };
  }
  