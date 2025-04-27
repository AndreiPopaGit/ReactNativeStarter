import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem } from '../../types';

/**
 * Extend every food item with a unique id and a transient `pending` flag
 * so we can show independent undo placeholders that *do not expire*.
 */
interface FoodItemWithState extends FoodItem {
  id: string;
  pending: boolean;
}

interface ResultsViewProps {
  imageUri?: string;
  foodData: FoodItem[];
  onAddToLog: (items: FoodItem[]) => void;
  onRetake: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  imageUri,
  foodData,
  onAddToLog,
  onRetake,
}) => {
  /** Local list of items with deletion state */
  const [items, setItems] = useState<FoodItemWithState[]>([]);

  /**
   * Initialise on first render or when the parent supplies new data.
   */
  useEffect(() => {
    const now = Date.now();
    setItems(
      foodData.map((f, idx) => ({
        ...f,
        id: `${f.name}-${idx}-${now}`,
        pending: false,
      }))
    );
  }, [foodData]);

  /* ------------------------------------------------------------------ */
  /* ----------------------   Utils & helpers   ----------------------- */
  /* ------------------------------------------------------------------ */

  const calculateTotals = (foods: FoodItemWithState[]) =>
    foods.reduce(
      (tot, f) => ({
        calories: tot.calories + (Number(f.kcal) || 0),
        protein: tot.protein + (Number(f.protein) || 0),
        carbs: tot.carbs + (Number(f.carbs) || 0),
        fat: tot.fat + (Number(f.fats) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const visibleItems = items.filter((i) => !i.pending);
  const totals = calculateTotals(visibleItems);

  /* ------------------------------------------------------------------ */
  /* -----------------------   Delete / Undo   ------------------------ */
  /* ------------------------------------------------------------------ */

  const markDeleted = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, pending: true } : it)));
  };

  const undoDelete = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, pending: false } : it)));
  };

  /* ------------------------------------------------------------------ */
  /* ---------------------   Add to daily log   ----------------------- */
  /* ------------------------------------------------------------------ */

  const handleAddToLog = () => {
    if (visibleItems.length === 0) {
      Alert.alert('No Items', 'There are no food items to add to your log.');
      return;
    }

    // Strip helper keys before sending back.
    onAddToLog(
      visibleItems.map(({ id, pending, ...food }) => ({ ...food }))
    );
  };

  /* ------------------------------------------------------------------ */
  /* -------------------------   RENDER   ----------------------------- */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------------------- */}
      {/*                         HEADER CARD                          */}
      {/* ------------------------------------------------------------- */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="image-outline" size={50} color="#cbd5e1" />
            </View>
          )}

          <View style={styles.matchedRow}>
            <Text
              style={styles.matchedName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {visibleItems[0]?.name || 'Identified Food'}
            </Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Total Estimated Calories</Text>
            <Text style={styles.calories}>{Math.round(totals.calories)} kcal</Text>

            <View style={styles.macrosRow}>
              <Macro label="Protein" value={`${totals.protein.toFixed(1)}g`} />
              <Macro label="Carbs" value={`${totals.carbs.toFixed(1)}g`} />
              <Macro label="Fat" value={`${totals.fat.toFixed(1)}g`} />
            </View>
          </View>
        </View>

        {/* ----------------------------------------------------------- */}
        {/*                    IDENTIFIED ITEMS LIST                   */}
        {/* ----------------------------------------------------------- */}
        <View style={styles.listWrapper}>
          <Text style={styles.listTitle}>Identified Items ({visibleItems.length})</Text>

          {items.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No food items identified</Text>
            </View>
          )}

          {items.map((item) =>
            item.pending ? (
              <PendingRow key={item.id} onUndo={() => undoDelete(item.id)} />
            ) : (
              <FoodRow key={item.id} item={item} onDelete={() => markDeleted(item.id)} />
            )
          )}
        </View>

        <Text style={styles.disclaimer}>
          Nutritional information is estimated based on image recognition. Verify for
          accuracy.
        </Text>
      </ScrollView>

      {/* ----------------------------------------------------------- */}
      {/*                        ACTION BAR                           */}
      {/* ----------------------------------------------------------- */}
      <View style={styles.actionsBar}>
        <ActionButton style={styles.retakeBtn} onPress={onRetake}>
          <Ionicons name="refresh-outline" size={20} color="#3b82f6" />
          <Text style={styles.retakeTxt}>Scan Again</Text>
        </ActionButton>

        <ActionButton
          style={[styles.addBtn, visibleItems.length === 0 && styles.disabledBtn]}
          onPress={handleAddToLog}
          disabled={visibleItems.length === 0}
        >
          <Ionicons name="add-circle-outline" size={22} color="white" />
          <Text style={styles.addTxt}>Add to Log</Text>
        </ActionButton>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------- */
/* --------------------------  Sub-components  ------------------------- */
/* -------------------------------------------------------------------- */

type WithChildren<T = {}> = T & { children?: React.ReactNode };

type ActionButtonProps = WithChildren<{
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}>;

const ActionButton = ({ onPress, disabled, style, children }: ActionButtonProps) => (
  <TouchableOpacity
    style={[styles.actionBtn, style, disabled && styles.disabledBtn]}
    onPress={onPress}
    disabled={disabled}
  >
    {children}
  </TouchableOpacity>
);

const Macro = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.macroBox}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
  </View>
);

const FoodRow = ({
  item,
  onDelete,
}: {
  item: FoodItemWithState;
  onDelete: () => void;
}) => (
  <View style={styles.foodRow}>
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={styles.foodName}>{item.name || 'Unknown Item'}</Text>
    </View>
    <Text style={styles.foodCalories}>{item.kcal || 0} cal</Text>
    <TouchableOpacity style={styles.delBtn} onPress={onDelete}>
      <Ionicons name="trash-outline" size={20} color="#ef4444" />
    </TouchableOpacity>
  </View>
);

const PendingRow = ({ onUndo }: { onUndo: () => void }) => (
  <View style={styles.pendingRow}>
    <Text style={styles.pendingTxt}>Item removed</Text>
    <TouchableOpacity onPress={onUndo} style={styles.undoBtnRow}>
      <Text style={styles.undoTxtRow}>UNDO</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scroll: { flex: 1 },
    /* CARD */
    card: {
      backgroundColor: 'white',
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#9ca3af',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
    },
    image: { width: '100%', height: 220, backgroundColor: '#e2e8f0' },
    placeholder: { justifyContent: 'center', alignItems: 'center' },
    matchedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: '#f1f5f9',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    matchedName: {
      color: '#1e293b',
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      marginRight: 10,
    },
    summary: { padding: 16 },
    summaryLabel: { fontSize: 14, color: '#64748b', marginBottom: 4 },
    calories: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    macrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
      paddingTop: 16,
    },
    macroBox: { alignItems: 'center', flex: 1 },
    macroLabel: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    macroValue: { fontSize: 18, fontWeight: '600', color: '#334155' },
    /* LIST */
    listWrapper: {
      backgroundColor: 'white',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#9ca3af',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    foodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
    },
    foodName: { fontSize: 15, fontWeight: '500', color: '#334155' },
    foodCalories: {
      fontSize: 15,
      fontWeight: '600',
      color: '#0ea5e9',
      minWidth: 60,
      textAlign: 'right',
      marginRight: 8,
    },
    delBtn: { padding: 8, marginLeft: 8 },
    /* PENDING ROW */
    pendingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f87171',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    pendingTxt: { color: '#fff', fontSize: 14 },
    undoBtnRow: { padding: 4 },
    undoTxtRow: { color: '#fff', fontWeight: '700', fontSize: 14 },
    /* EMPTY */
    emptyBox: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#64748b', fontSize: 15 },
    /* DISCLAIMER */
    disclaimer: {
      fontSize: 12,
      color: '#64748b',
      textAlign: 'center',
      marginHorizontal: 24,
      marginBottom: 10,
      lineHeight: 18,
    },
    /* ACTIONS */
    actionsBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      backgroundColor: '#ffffff',
      paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 8,
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    retakeBtn: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
    },
    retakeTxt: { color: '#3b82f6', fontWeight: '600', fontSize: 16, marginLeft: 8 },
    addBtn: { backgroundColor: '#16a34a' },
    addTxt: { color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 8 },
    disabledBtn: { backgroundColor: '#9ca3af', opacity: 0.7 },
  });
  
  export default ResultsView;