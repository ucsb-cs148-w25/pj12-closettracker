import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import EvilIcons from '@expo/vector-icons/FontAwesome';
import { doc, getDoc, updateDoc, addDoc, deleteDoc, collection, setDoc, DocumentData } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import { useUser } from '@/context/UserContext';

interface WearCountButtonProps {
  // title: string;   // 'title' should be a string
  onPress: () => void; // 'onPress' should be a function that returns void (i.e., no return value)
}

const IncreaseWearButton: React.FC<WearCountButtonProps> = ({ onPress }) => {
  return (
    <EvilIcons name="plus" size={20} style={styles.button} onPress={onPress} />
  );
};
const DecreaseWearButton: React.FC<WearCountButtonProps> = ({ onPress }) => {
  return (
    <EvilIcons name="minus" size={20} style={styles.button} onPress={onPress} />
  );
};



export default function TimesWornComponent({
  itemId,
  wearCountFromDB,
  collectionId,
}: {
  itemId: string;
  wearCountFromDB: number;
  collectionId: string;

}) {

  const { currentUser } = useUser();

  const updateWearCount = async (newCount: number) => {
    if (!itemId || newCount < 0) return;

    if (!currentUser) return;

    const itemRef = doc(db, "users", currentUser.uid, collectionId, itemId);

    try {
      await updateDoc(itemRef, { wearCount: newCount });
    } catch (error) {
      console.error("Error updating wear count:", error);
    }
  };

  const [wearCount, setWearCount] = useState(wearCountFromDB);
  const handleIncrement = () => {
    setWearCount(wearCount + 1)
    if (wearCount === 4) {
      Alert.alert("High five!", "Five’s up—time to wash up!");
    }
    updateWearCount(wearCount + 1);
    if (wearCount === 8) {
      Alert.alert("Ten!", "Get that wash!");
    }
  };

  const handleDecrement = () => {
    setWearCount(wearCount - 1);
    updateWearCount(wearCount - 1);
  }

  // Max wear count (adjust this to fit your needs)
  const maxWearCount = 8;

  // Function to determine square color based on wear count
  const getSquareColor = (index: number) => {
    if (index < wearCount) {
      // Calculate normalized wear factor (from 0 to 1)
      const t = (index + 1) / maxWearCount;

      if (t <= 0.7) {
        // Phase 1: Interpolate from white to red
        // Normalize t within [0, 0.7]
        const t2 = t / 0.7;
        const r = 255;
        const g = Math.round(255 * (1 - t2));
        const b = Math.round(255 * (1 - t2));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Phase 2: Interpolate from red to dark red ("black red")
        // Normalize t within [0.7, 1]
        const t2 = (t - 0.7) / 0.3;
        const r = Math.round(255 - (255 - 139) * t2); // from 255 to 139
        const g = 0;
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      return '#FFFFFF';  // Clean clothes (white)
    }
  };

  // Create an array of squares based on maxWearCount
  const renderWearSquares = () => {
    let squares = [];
    for (let i = 0; i < maxWearCount; i++) {
      squares.push(
        <View
          key={i}
          style={[
            styles.tracker,
            { backgroundColor: getSquareColor(i) }, // Color based on wear count
          ]}
        />
      );
    }
    return squares;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DecreaseWearButton onPress={handleDecrement} />
        <View style={styles.wearSquaresContainer}>
          {renderWearSquares()}
        </View>
        <IncreaseWearButton onPress={handleIncrement} />
      </View>



      <Text style={styles.counterText}>Times Worn: {wearCount}</Text>

      {/* Buttons for increment and decrement */}
    </View>
  );
};


const styles = StyleSheet.create({
  button: {
    margin: 10,
    backgroundColor: '#ADD8E6',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,  // Rounded corners
    elevation: 4,     // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  counterText: {
    fontSize: 18,
    marginBottom: 10,
  },
  tracker: {
    width: 10,
    height: 30,
    margin: 5,
    borderRadius: 5, // Rounds the corners of the squares
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  wearSquaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .4,
    shadowRadius: 2.5,
  },
  row: {
    backgroundColor: 'white',
    maxWidth: '90%',
    padding: 5,
    margin: 5,
    flexDirection: 'row',  // Arrange items in a row (horizontally)
    alignItems: 'center',  // Center the icons vertically
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: .2,
    shadowRadius: 2.5,
  },
});