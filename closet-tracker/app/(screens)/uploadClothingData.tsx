import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Button, View, ActivityIndicator, Image } from 'react-native';
import {SafeAreaProvider } from 'react-native-safe-area-context';

import { doc, updateDoc, getDoc, getFirestore, DocumentSnapshot, serverTimestamp } from "firebase/firestore"; 
import { auth } from '@/FirebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import clothingDataDropdowns from '@/components/UploadClothingComponents';
import supabase from '@/supabase';

type ItemData = {
    id: string;
    name: string;
    clothingType: string;
    size: string;
    color: string;
    brand: string;
    note: string;
    image_url: string;
    wearCount: number;
};

const uploadClothingData = () => {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  let { item_id } = useLocalSearchParams(); // Get query params

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
        const docRef = doc(db, "users", userid, "clothing", String(item_id))
          
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

        if(dataName){
          setName(dataName)
        } 
        else{
          setError('No name found'); //Fixme might over write no url errpr
        }
      } catch (err) {
        setError('Error fetching item data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemData();
  }, [item_id]);
  
  const handleSubmit = async (
    name: string | null,
    size: string | null,
    color: string | null,
    clothingType: string | null,
    brand: string,
    note: string
  ) => {
    console.log('Clothing Item Data:');
    console.log({
      name,
      size,
      color,
      clothingType,
      brand,
      note,
    });
    
    try {
      // Step 1: Get the current document (if you need to use the data)
      if (!user) {
        alert("Please sign in before uploading your clothes.");
        return;
      }
      const userid = user.uid
      const docRef = doc(db, "users", userid, "clothing", String(item_id))
      
      // const snapshot = await getDoc(docRef);
      // if (snapshot.exists()) {
      //   console.log("Document data:", snapshot.data());
      //   setDocSnapshot(snapshot); // ✅ Update state when the document is fetched
      // } else {
      //   console.log("No such document!");
      //   // setDocSnapshot();
      // }

      // Step 2: Set a new document (or update if it exists)
      await updateDoc(docRef, {
        name: name,
        size: size,
        color: color,
        clothingType: clothingType,
        brand: brand,
        note: note,
        wearCount: 0,
        dateUploaded: serverTimestamp()
      });
      
      //go back to wardrobe
      router.push(`../(tabs)/wardrobe`);
      console.log('Clothing item data added to Firestore:', docRef);
    } catch (error) {
      console.error('Error interacting with Firestore: ', error);
    }
};

  // BUG causes hooking error 
  // if (loading) { return <ActivityIndicator  style={styles.container} size="large" color="black" />; }
  // if (error)   { return <View style={styles.container}>
  //                           {error && ( <Text style={styles.errorContainer}>{error}</Text> )}
  //                       </View>}

  return (
    <SafeAreaProvider>

    <View style={styles.container}>
      {imageUri && (
            <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}
      <Text style={{color:'black', fontSize:20}}> {name} </Text> 
      {clothingDataDropdowns({handleSubmit, docSnapshot})}
    </View>

    </SafeAreaProvider>
    
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

export default uploadClothingData;
