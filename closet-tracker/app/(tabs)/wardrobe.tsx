import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, Button, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export type ItemData = {
  id: string;
  title: string;
  wearCount: number;
  lastWorn: string;
};

export const DATA: ItemData[] = [
  { id: '1', title: 'Shirt', wearCount: 3, lastWorn: '2025-01-20T12:00:00Z' },
  { id: '2', title: 'Cardigan', wearCount: 3, lastWorn: '2025-01-19T12:00:00Z' },
  { id: '3', title: 'Pants', wearCount: 3, lastWorn: '2025-01-22T12:00:00Z' },
  { id: '4', title: 'Jacket', wearCount: 2, lastWorn: '2025-01-18T12:00:00Z' },
  { id: '5', title: 'Sweater', wearCount: 5, lastWorn: '2025-01-21T12:00:00Z' },
  { id: '6', title: 'Jeans', wearCount: 4, lastWorn: '2025-01-15T12:00:00Z' },
  { id: '11', title: 'Shirt', wearCount: 3, lastWorn: '2025-01-20T12:00:00Z' },
  { id: '12', title: 'Cardigan', wearCount: 3, lastWorn: '2025-01-19T12:00:00Z' },
  { id: '13', title: 'Pants', wearCount: 3, lastWorn: '2025-01-22T12:00:00Z' },
  { id: '14', title: 'Jacket', wearCount: 2, lastWorn: '2025-01-18T12:00:00Z' },
  { id: '15', title: 'Sweater', wearCount: 5, lastWorn: '2025-01-21T12:00:00Z' },
  { id: '16', title: 'Jeans', wearCount: 4, lastWorn: '2025-01-15T12:00:00Z' },
];

type ItemProps = {
  item: ItemData;
  onPress: () => void;
  onLongPress: () => void;
  backgroundColor: string;
  textColor: string;
};

const Item = ({ item, onPress, onLongPress, backgroundColor, textColor }: ItemProps) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.item, { backgroundColor }]}>
    <Text style={[styles.itemText, { color: textColor }]}>{item.title}</Text>
  </TouchableOpacity>
);

export default function WardrobeScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Selected IDs:', selectedIds);
  }, [selectedIds]);

  const handleItemPress = (itemId: string) => {
    if (selectMode) {
      setSelectedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      router.push(`../(screens)/ClothingTracker?item=${itemId}`);
    }
  };

  const handleItemLongPress = (itemId: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([itemId]);
    }
  };

  const handleCancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const renderItem = ({ item }: { item: ItemData }) => {
    const isSelected = selectedIds.includes(item.id);
    const backgroundColor = isSelected ? '#4160fb' : '#a5b4fd';
    const textColor = isSelected ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => handleItemPress(item.id)}
        onLongPress={() => handleItemLongPress(item.id)}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wardrobe</Text>
          {selectMode && (
            <Button title="Cancel Selection" onPress={handleCancelSelection} color="red" />
          )}
        </View>

        <FlatList
          contentContainerStyle={styles.clothesContainer}
          style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={selectedIds}
          numColumns={2}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  clothesContainer: {
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    width: '45%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#a5b4fd',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
