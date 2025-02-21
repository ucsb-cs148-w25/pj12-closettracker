import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for local search params
// import { IncreaseWearButton, DecreaseWearButton } from '@/components/SingleItemComponents'
import TimesWornComponent from '@/components/SingleItemComponents' 
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/FirebaseConfig";
import {SafeAreaProvider } from 'react-native-safe-area-context';

export default function singleItem() {
  const { item, collections } = useLocalSearchParams(); // Get query params
  const itemId = Array.isArray(item) ? item[0] : item;
  const collectionId = Array.isArray(collections) ? collections[0] : collections;
  const router = useRouter();
  //console.log('Item from query param:', item);  // Debugging: Check if item is passed correctly
  
  const [itemData, setItemData] = useState<DocumentData | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      const auth = getAuth(); // Get Firebase Auth instance
      const user = auth.currentUser; // Get the logged-in user

      if (!user) {
        console.error("No user is logged in!");
        return;
      }

      const userId = user.uid; // Get the logged-in user's ID
      const itemRef = doc(db, "users", userId, collectionId, itemId);

      try {
        const docSnap = await getDoc(itemRef);
        if (docSnap.exists()) {
          setItemData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    fetchItem();
  }, [itemId]);

  if (!itemData) {
    return <Text>Loading...</Text>;
  }

  // const handleIncrement = () => {
  //   const newWearCount = itemData.wearCount + 1;
  //   setItemData({ ...itemData, wearCount: newWearCount});
  // };

  // const handleDecrement = () => {
  //   const newWearCount = itemData.wearCount > 0 ? itemData.wearCount - 1 : 0;
  //   setItemData({ ...itemData, wearCount: newWearCount});
  // };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {itemData.image && (
          <Image source={{ uri: itemData.image }} style={styles.image} />
        )}
        <Text style={styles.title}>{itemData.itemName}</Text>
        {/* <TimesWornComponent /> */}
        <Button title="Back" onPress={() => router.back()} />
      </View>
    </SafeAreaProvider>
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
