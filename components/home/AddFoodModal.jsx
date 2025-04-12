import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddFoodModal({
  visible,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredFoods,
  addFoodToMeal,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />

          {/* Food List */}
          <FlatList
            data={filteredFoods}
            keyExtractor={(item) => item.id}
            style={styles.foodList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.foodListItem}
                onPress={() => addFoodToMeal(item)}
              >
                <View>
                  <Text style={styles.foodListItemName}>{item.name}</Text>
                  <Text style={styles.foodListItemCalories}>
                    {item.caloriesPer100g} cal / 100g
                  </Text>
                </View>

                <View style={styles.foodListMacros}>
                  <Text style={styles.foodListMacro}>P: {item.proteinPer100g}g</Text>
                  <Text style={styles.foodListMacro}>C: {item.carbsPer100g}g</Text>
                  <Text style={styles.foodListMacro}>F: {item.fatPer100g}g</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  foodList: {
    maxHeight: 400,
  },
  foodListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  foodListItemName: {
    fontSize: 16,
    color: '#333',
  },
  foodListItemCalories: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  foodListMacros: {
    flexDirection: 'row',
  },
  foodListMacro: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});
