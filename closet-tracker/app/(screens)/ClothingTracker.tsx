import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for local search params

type ItemData = {
  id: string;
  title: string;
  wearCount: number;
  lastWorn: string;
};

// Fake data simulating your wardrobe
const fakeData: ItemData[] = [
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

export default function ClothingTracker() {
  const { item } = useLocalSearchParams(); // Get query params
  const router = useRouter();
  // console.log('Item from query param:', item);  // Debugging: Check if item is passed correctly

  
  const [itemData, setItemData] = useState<ItemData | null>(null);

  useEffect(() => {
    if (item) {
      // Find the item from fake data based on item.id
      console.log('Item from query param:',  item === '2}');  // Debugging: Check if item is passed correctly
      const foundItem = fakeData.find((data) => data.id === item); // `item` is a string
      setItemData(foundItem || null); // Set the found item, or null if not found
    }
  }, [item]); // Dependency array

  if (!itemData) return <Text style={{fontSize:18, color:'white', textAlign:'center'}}>Loading...</Text>; //FIXME doesn't work rn

  const handleIncrement = () => {
    const newWearCount = itemData.wearCount + 1;
    setItemData({ ...itemData, wearCount: newWearCount, lastWorn: new Date().toISOString() });
  };

  const handleDecrement = () => {
    const newWearCount = itemData.wearCount > 0 ? itemData.wearCount - 1 : 0;
    setItemData({ ...itemData, wearCount: newWearCount, lastWorn: new Date().toISOString() });
  };

  return (

    <View style={styles.container}>
      
      <Text style={styles.title}>{itemData.title}</Text>
      <Text>Times Worn: {itemData.wearCount}</Text>
      <Text>Last Worn: {new Date(itemData.lastWorn).toLocaleDateString()}</Text>
      <Button title="Increment Wear Count" onPress={handleIncrement} />
      <Button title="Decrement Wear Count" onPress={handleDecrement} />
      <Button title="Back to Wardrobe" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
