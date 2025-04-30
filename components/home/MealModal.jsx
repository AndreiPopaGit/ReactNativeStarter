import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MealModal({
  visible,
  selectedMeal,
  isNewMeal,
  newMealName,
  setNewMealName,
  newMealTime,
  setNewMealTime,
  closeMealModal,
  saveMeal,
  startEditingQuantity,
  editingFoodId,
  editingQuantity,
  setEditingQuantity,
  saveQuantity,
  removeFood,
  openAddFoodModal,
}) {
  if (!selectedMeal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={closeMealModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header: Meal name & close button */}
          <View style={styles.modalHeader}>
            {isNewMeal ? (
              <TextInput
                style={styles.mealNameInput}
                value={newMealName}
                onChangeText={setNewMealName}
                placeholder="Meal name"
              />
            ) : (
              <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeMealModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Meal time */}
          <View style={styles.mealTimeContainer}>
            {isNewMeal ? (
              <TextInput
                style={styles.mealTimeInput}
                value={newMealTime}
                onChangeText={setNewMealTime}
                placeholder="Time (e.g., 8:00 AM)"
              />
            ) : (
              <Text style={styles.mealTimeText}>{selectedMeal.time}</Text>
            )}
          </View>

          {/* Foods list */}
          <ScrollView style={{ maxHeight: 300 }}>
            {selectedMeal.foods && selectedMeal.foods.length > 0 ? (
              selectedMeal.foods.map((food) => (
                <View key={food.id} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <View style={styles.foodNutrients}>
                      <Text style={styles.foodCalories}>{food.calories} Kcal</Text>
                      <Text style={styles.foodNutrient}>P: {food.protein}g</Text>
                      <Text style={styles.foodNutrient}>C: {food.carbs}g</Text>
                      <Text style={styles.foodNutrient}>F: {food.fat}g</Text>
                    </View>
                  </View>

                  <View style={styles.foodActions}>
                    {editingFoodId === food.id ? (
                      <View style={styles.quantityEditContainer}>
                        <TextInput
                          style={styles.quantityInput}
                          value={editingQuantity}
                          onChangeText={setEditingQuantity}
                          keyboardType="numeric"
                          autoFocus
                        />
                        <Text style={styles.unitText}>g</Text>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => saveQuantity(selectedMeal.id, food.id)}
                        >
                          <Ionicons name="checkmark" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.quantityContainer}
                        onPress={() => startEditingQuantity(food.id, food.quantity)}
                      >
                        <Text style={styles.quantityText}>
                          {food.quantity}g
                        </Text>
                        <Ionicons name="create-outline" size={16} color="#2196F3" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFood(selectedMeal.id, food.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyFoodList}>
                <Text style={styles.emptyFoodListText}>
                  No food items added yet. Add your first item below.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action buttons: Add Food, Save Meal */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.addFoodButton} onPress={openAddFoodModal}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addFoodText}>Add Food</Text>
            </TouchableOpacity>

            {isNewMeal && (
              <TouchableOpacity
                style={[
                  styles.saveMealButton,
                  { opacity: selectedMeal.foods.length === 0 ? 0.5 : 1 },
                ]}
                onPress={saveMeal}
                disabled={selectedMeal.foods.length === 0}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveMealText}>Save Meal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  mealNameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  mealTimeContainer: {
    marginBottom: 15,
  },
  mealTimeInput: {
    fontSize: 14,
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  mealTimeText: {
    fontSize: 14,
    color: '#666',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  foodNutrients: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodCalories: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  foodNutrient: {
    fontSize: 13,
    color: '#777',
    marginRight: 8,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  quantityText: {
    marginRight: 5,
    color: '#333',
  },
  quantityEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityInput: {
    backgroundColor: '#F0F0F0',
    width: 50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    textAlign: 'center',
  },
  unitText: {
    marginHorizontal: 5,
    color: '#333',
  },
  saveButton: {
    padding: 5,
  },
  removeButton: {
    padding: 5,
  },
  emptyFoodList: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFoodListText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addFoodButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  addFoodText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  saveMealButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  saveMealText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
