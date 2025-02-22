import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TimesWornComponent from '@/components/SingleItemComponents'
import { doc, getDoc, updateDoc, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/FirebaseConfig";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function singleItem() {
  const { item, collections } = useLocalSearchParams();
  const itemId = Array.isArray(item) ? item[0] : item;
  const collectionId = Array.isArray(collections) ? collections[0] : collections;
  const router = useRouter();

  const [itemData, setItemData] = useState<DocumentData | null>(null);
  const [wearCount, setWearCount] = useState<number>(0);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in!");
        return;
      }

      const userId = user.uid;
      const itemRef = doc(db, "users", userId, collectionId, itemId);

      try {
        const docSnap = await getDoc(itemRef);
        if (docSnap.exists()) {
          setItemData(docSnap.data());
          setWearCount(docSnap.data().wearCount || 0);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    fetchItem();
  }, [itemId]);

  const updateWearCount = async (newCount: number) => {
    if (!itemId || newCount < 0) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const itemRef = doc(db, "users", userId, collectionId, itemId);

    try {
      await updateDoc(itemRef, { wearCount: newCount });
      setWearCount(newCount);
    } catch (error) {
      console.error("Error updating wear count:", error);
    }
  };

  if (!itemData) {
    return <Text>Loading...</Text>;
  }



  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {itemData.image && (
          <Image source={{ uri: itemData.image }} style={styles.image} />
        )}
        <Text style={styles.title}>{itemData.itemName}</Text>
        <Text style={styles.wearCountText}>Times Worn: {wearCount}</Text>

        <View style={styles.buttonContainer}>
          <Pressable onPress={() => updateWearCount(wearCount - 1)} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </Pressable>
          <Pressable onPress={() => updateWearCount(wearCount + 1)} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </Pressable>
        </View>

        { }
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wearCountText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4160fb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    resizeMode: 'contain',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
