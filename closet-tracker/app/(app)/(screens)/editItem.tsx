import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, getDoc, getFirestore, DocumentSnapshot, serverTimestamp, collection } from "firebase/firestore"; 
import { auth } from '@/FirebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OutfitDataDropdowns from '@/components/UploadOutfitComponents';
import ClothingDataDropdowns from '@/components/UploadClothingComponents';

export default function EditItem () {
  const [itemName, setItemName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { item_id, collections } = useLocalSearchParams(); // Get query params
  const collectionId = Array.isArray(collections) ? collections[0] : collections;
  const router = useRouter();
  const db = getFirestore();
  const user = auth.currentUser;
  const [docSnapshot, setDocSnapshot] = useState<DocumentSnapshot | null>(null);

  useEffect(() => {
    const fetchItemData = async () => {
      setLoading(true);
      setError(null); // Reset error state

      try {
        // Fetch the item document from Firestore
        console.log(item_id)
        if (!user) {
            alert("Please sign in before uploading your clothes.");
            return;
        }

        const userid = user.uid
        const docRef = doc(db, "users", userid, collectionId, String(item_id))
          
        const itemDoc = await getDoc(docRef);
        if (itemDoc.exists()) {
          console.log("Document data:", itemDoc.data());
          setDocSnapshot(itemDoc)
        } else {
          console.log("No such document!");
        }

        // Extract the image_url from the document data
        const itemData = itemDoc.data();
        const imageUrl = itemData?.image;
        const dataName = itemData?.itemName;
        if (imageUrl) {
          setImageUri(imageUrl); 
        } 
        else {
          setError('No image URL found');
        }

        if (dataName) {
          setItemName(dataName);
        }
        else {
          setError('No name found');
        }
      } catch (err) {
        setError('Error fetching item data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemData();
  }, [item_id]);
    
  const handleClothingSubmit = async (
    itemName: string | null,
    size: string | null,
    color: string | null,
    clothingType: string | null,
    brand: string,
    note: string
  ) => {
    if (!user) {
      alert("Please sign in before uploading your clothes.");
      return;
    }
    
    try {
      // Step 1: Get the current document (if you need to use the data)
      const userid = user.uid
      const docRef = doc(db, "users", userid, "clothing", String(item_id))
      

      // Step 2: Set a new document (or update if it exists)
      await updateDoc(docRef, {
        itemName: itemName,
        size: size,
        color: color,
        clothingType: clothingType,
        brand: brand,
        note: note,
        wearCount: 0,
        dateUploaded: serverTimestamp()
      });
      
      //go back to wardrobe
      router.back();
    } catch (error) {
      console.error('Error interacting with Firestore: ', error);
    }
  };
    
  const handleLaundrySubmit = async (
    itemName: string | null,
    size: string | null,
    color: string | null,
    clothingType: string | null,
    brand: string,
    note: string
  ) => {
    if (!user) {
      alert("Please sign in before uploading your clothes.");
      return;
    }
    
    try {
      // Step 1: Get the current document (if you need to use the data)
      const userid = user.uid
      const docRef = doc(db, "users", userid, "laundry", String(item_id))
      

      // Step 2: Set a new document (or update if it exists)
      await updateDoc(docRef, {
        itemName: itemName,
        size: size,
        color: color,
        clothingType: clothingType,
        brand: brand,
        note: note,
        wearCount: 0,
        dateUploaded: serverTimestamp()
      });
      
      //go back to wardrobe
      router.back();
    } catch (error) {
      console.error('Error interacting with Firestore: ', error);
    }
  };
  
  const handleOutfitSubmit = async (
    itemName: string | null,
    note: string
  ) => {
    if (!user) {
      alert("Please sign in before uploading your clothes.");
      return;
    }
    
    try {
      // Step 1: Get the current document (if you need to use the data)
      const userid = user.uid
      const docRef = doc(db, "users", userid, "outfit", String(item_id))
      

      // Step 2: Set a new document (or update if it exists)
      await updateDoc(docRef, {
        itemName: itemName,
        note: note,
        wearCount: 0,
        dateUploaded: serverTimestamp()
      });
      
      //go back to outfit
      router.back();
    } catch (error) {
      console.error('Error interacting with Firestore: ', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}
      <Text style={{color:'black', fontSize:20}}> {itemName} </Text> 
      {collectionId === 'outfit' ? (
        <OutfitDataDropdowns handleOutfitSubmit={handleOutfitSubmit} docSnapshot={docSnapshot}/>
      ) : collectionId === 'clothing' ? (
        <ClothingDataDropdowns handleClothingSubmit={handleClothingSubmit} docSnapshot={docSnapshot}/>
      ) : collectionId === 'laundry' ? (
        <ClothingDataDropdowns handleClothingSubmit={handleLaundrySubmit} docSnapshot={docSnapshot}/>
      ) : (
        <Text> Collection not found </Text>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',  // Centers content vertically
        alignItems: 'center',      // Centers content horizontally
        position: 'relative',      // This is important for absolute positioning inside it
        padding: 20,
      },
      errorContainer: {
        backgroundColor: 'red',    // Error message background
        color: 'white',            // Error message text color
        padding: 15,
        borderRadius: 5,
        textAlign: 'center',
        position: 'absolute',      // Absolute positioning to center on the screen
        top: '50%',                // 50% from the top of the screen
        width: '80%',              // You can adjust the width as needed
      },
  });