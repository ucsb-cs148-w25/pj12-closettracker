import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for local search params
// import { IncreaseWearButton, DecreaseWearButton } from '@/components/SingleItemComponents'
import TimesWornComponent from '@/components/SingleItemComponents' 

type ItemData = {
  id: string;
  title: string;
  wearCount: number;
};

// Fake data simulating your wardrobe
const fakeData: ItemData[] = [
  { id: '1', title: 'Shirt', wearCount: 3 },
  { id: '2', title: 'Cardigan', wearCount: 5 },
  { id: '3', title: 'Pants', wearCount: 2 },
];

export default function singleItem() {
  const { item } = useLocalSearchParams(); // Get query params
  const router = useRouter();
  // console.log('Item from query param:', item);  // Debugging: Check if item is passed correctly

  
  const [itemData, setItemData] = useState<ItemData | null>(null);

  useEffect(() => {
    if (item) {
      // Find the item from fake data based on item.id
      console.log('Item from query param:',  item);  // Debugging: Check if item is passed correctly
      const foundItem = fakeData.find((data) => data.id === item); // `item` is a string
      setItemData(foundItem || null); // Set the found item, or null if not found
    }
  }, [item]); // Dependency array

  if (!itemData) return <Text style={{fontSize:18, color:'white', textAlign:'center'}}>Loading...</Text>; //FIXME doesn't work rn

  const handleIncrement = () => {
    const newWearCount = itemData.wearCount + 1;
    setItemData({ ...itemData, wearCount: newWearCount});
  };

  const handleDecrement = () => {
    const newWearCount = itemData.wearCount > 0 ? itemData.wearCount - 1 : 0;
    setItemData({ ...itemData, wearCount: newWearCount});
  };

  return (

    <View style={styles.container}>
      <Image
        source={require('@/assets/fakeData/images/buisnessBlazer.png')}
        style={styles.image}
      />
      <Text style={styles.title}>{itemData.title}</Text>
      <TimesWornComponent />
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
    backgroundColor: 'FFEFCB',
  },
  row: {
    flexDirection: 'row',  // Arrange items in a row (horizontally)
    alignItems: 'center',  // Center the icons vertically
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },image: {
    width: 300,  
    height: 300, 
    marginBottom: 20,  
    resizeMode: 'contain', // Keeps the aspect ratio of the image
    borderRadius: 50, 
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
