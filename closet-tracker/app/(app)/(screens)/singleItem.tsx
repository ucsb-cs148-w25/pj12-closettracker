import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TimesWornComponent from '@/components/SingleItemComponents'
import { doc, getDoc, updateDoc, addDoc, deleteDoc, collection, setDoc, DocumentData } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/context/UserContext';

export default function singleItem() {
  const { item, collections } = useLocalSearchParams();
  const itemId = Array.isArray(item) ? item[0] : item;
  const collectionId = Array.isArray(collections) ? collections[0] : collections;
  const router = useRouter();

  const [itemData, setItemData] = useState<DocumentData | null>(null);
  const [wearCount, setWearCount] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(false);
  const [publicDocId, setPublicDocId] = useState<string | null>(null);
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;

      if (!currentUser) {
        console.error("No user is logged in!");
        return;
      }

      const itemRef = doc(db, "users", currentUser.uid, collectionId, itemId);

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

  useEffect(() => {
    const checkPublicStatus = async () => {
      if (collectionId !== 'outfit' || !currentUser) return;
      const publicDocRef = doc(db, "users", currentUser.uid, "public", itemId);
      const publicDocSnap = await getDoc(publicDocRef);
      if (publicDocSnap.exists()) {
        setIsPublic(true);
        const data = publicDocSnap.data();
        setPublicDocId(data.publicRef);
      }
    };
    checkPublicStatus();
  }, [collectionId, itemId, currentUser]);

  // const updateWearCount = async (newCount: number) => {
  //   if (!itemId || newCount < 0) return;

  //   if (!currentUser) return;

  //   const itemRef = doc(db, "users", currentUser.uid, collectionId, itemId);

  //   try {
  //     await updateDoc(itemRef, { wearCount: newCount });
  //     setWearCount(newCount);
  //   } catch (error) {
  //     console.error("Error updating wear count:", error);
  //   }
  // };
  const handleEdit = () => {
    if (!currentUser || collectionId !== "clothing") return;
    router.push(`../(screens)/editItem?item_id=${itemId}&collections=${collectionId}`);
  };
  
  const handleMakePublic = async () => {
    if (collectionId !== 'outfit' || !currentUser) return;
    if (isPublic) {
      alert('This item is already public.');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const outfitRef = doc(db, "users", currentUser.uid, 'outfit', itemId);
      const newPublicDoc = await addDoc(collection(db, "public"), {
        outfitRef,
        userRef: doc(db, "users", currentUser.uid),
        likes: [],
        likesCount: 0,
        timestamp: new Date(),
      });
      await setDoc(doc(db, "users", currentUser.uid, "public", itemId), {
        publicRef: newPublicDoc.id,
      });
      setIsPublic(true);
      setPublicDocId(newPublicDoc.id);
    } catch (error) {
      console.error("Error making public:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePrivate = async () => {
    if (collectionId !== 'outfit' || !currentUser || !publicDocId) return;
    if (loading) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "public", publicDocId));
      await deleteDoc(doc(db, "users", currentUser.uid, "public", itemId));
      setIsPublic(false);
      setPublicDocId(null);
    } catch (error) {
      console.error("Error making private:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!itemData) {
    return <SafeAreaView><Text>Loading...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {itemData.image && (
            <Image source={{ uri: itemData.image }} style={styles.image} />
          )}
          <Text style={styles.title}>{itemData.itemName}</Text>

          <TimesWornComponent itemId={itemId} wearCountFromDB={wearCount} collectionId={collectionId} />
          
            {collectionId === 'clothing' && (
            <View style={styles.infoContainer}>
              {(itemData.size || itemData.color || itemData.clothingType || itemData.brand || itemData.note) ? (
                <>
                  <Text style={styles.infoHeader}>Item Details</Text>
                  {itemData.size && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📏 Size:</Text>
                      <Text style={styles.infoText}>{itemData.size}</Text>
                    </View>
                  )}
                  {itemData.color && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>🎨 Color:</Text>
                      <Text style={styles.infoText}>{itemData.color}</Text>
                    </View>
                  )}
                  {itemData.clothingType && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>👕 Type:</Text>
                      <Text style={styles.infoText}>{itemData.clothingType}</Text>
                    </View>
                  )}
                  {itemData.brand && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>🏷️ Brand:</Text>
                      <Text style={styles.infoText}>{itemData.brand}</Text>
                    </View>
                  )}
                  {itemData.note && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📝 Notes:</Text>
                      <Text style={styles.infoText}>{itemData.note}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.infoText}>No additional details available.</Text>
              )}
            </View>
            )}

          {collectionId === 'outfit' && (
            isPublic ? (
              <TouchableOpacity 
                onPress={handleMakePrivate} 
                style={[styles.publicButton, loading && styles.disabledButton]} 
                disabled={loading}
              >
                <Text style={styles.publicButtonText}>Make Private</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleMakePublic} 
                style={[styles.publicButton, loading && styles.disabledButton]} 
                disabled={loading}
              >
                <Text style={styles.publicButtonText}>Make Public</Text>
              </TouchableOpacity>
            )
          )}
          
          <View style={styles.buttonContainer}>
            <Pressable onPress={() => router.back()} style={styles.button}>
                <Text style={styles.buttonText}>Back</Text>
            </Pressable> 
            <Pressable onPress={() => handleEdit()} style={styles.button}>
                <Text style={styles.buttonText}>Edit</Text>
            </Pressable> 
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#ADD8E6',
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
  publicButton: {
    backgroundColor: '#4160fb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  publicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoContainer: {
    width: '90%',
    backgroundColor: '#f8f9fa', // Light gray background
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Subtle shadow effect
  },
  infoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // Light border for separation
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  scrollView: {
    flex: 1,
  }
});