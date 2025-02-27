import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Platform, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, getCountFromServer, updateDoc, arrayUnion, query, orderBy, increment, arrayRemove } from "firebase/firestore";
import PublicItem from '@/components/PublicItem';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  // State for user, counts, and public items
  const [user, setUser] = useState<any>(null);
  const [laundryCount, setLaundryCount] = useState(0);
  const [clothingCount, setClothingCount] = useState(0);
  const [publicItems, setPublicItems] = useState<any[]>([]);
  
  const auth = getAuth();
  const db = getFirestore();

  // Animated values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const completeOpacity = useRef(new Animated.Value(0)).current;

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchCounts(currentUser.uid);
    });
    return unsubscribe;
  }, []);

  // Fetch counts of clothing and laundry items
  const fetchCounts = async (uid: string) => {
    try {
      const laundrySnapshot = await getCountFromServer(collection(db, "users", uid, "laundry"));
      setLaundryCount(laundrySnapshot.data().count);
      const clothingSnapshot = await getCountFromServer(collection(db, "users", uid, "clothing"));
      setClothingCount(clothingSnapshot.data().count);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  // Set up listener for public items
  useEffect(() => {
    const publicRef = collection(db, "public");
    // Firestore does not allow ordering by array length; instead, we order by "likesCount"
    const q = query(publicRef, orderBy("likesCount", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublicItems(items);
    });
    return unsubscribe;
  }, []);

  // Start a rotation loop when loading
  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation(() => {
      rotateAnim.setValue(0);
    });
  };

  // Handle wash: trigger loading/rotation, then run wash, then animate complete text
  const handleWash = async () => {
    if (!user) return;
    startRotation();
    try {
      const laundryRef = collection(db, "users", user.uid, "laundry");
      const laundrySnapshot = await getDocs(laundryRef);
      const promises = laundrySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const clothingDocRef = doc(db, "users", user.uid, "clothing", docSnap.id);
        await setDoc(clothingDocRef, data);
        await deleteDoc(doc(db, "users", user.uid, "laundry", docSnap.id));
      });
      await Promise.all(promises);
      // Refresh counts
      fetchCounts(user.uid);
    } catch (error) {
      console.error("Error washing items:", error);
    }
    stopRotation();

    // Animate completion text opacity: fade in then fade out.
    completeOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(completeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(completeOpacity, { toValue: 0, duration: 1000, delay: 500, useNativeDriver: true }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Row of stats and wash button */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{laundryCount}</Text>
          <Text>Laundry Items</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{clothingCount}</Text>
          <Text>Clean Clothes</Text>
        </View>
        <TouchableOpacity style={styles.washButton} onPress={handleWash}>
          <Animated.Text style={[styles.washText, { transform: [{ rotate: rotation }] }]}>
            Wash
          </Animated.Text>
        </TouchableOpacity>
      </View>
      {/* Animated complete text */}
      <Animated.View style={[styles.completeContainer, { opacity: completeOpacity }]}>
        <Text style={styles.completeText}>Washing Complete!</Text>
      </Animated.View>
      
      {/* Horizontal list of public items */}
      <Text style={styles.sectionTitle}>Public Items</Text>
      {publicItems.length === 0 ? (
        <View style={styles.emptyPublicContainer}>
          <Text style={styles.emptyPublicText}>No public items available.</Text>
        </View>
      ) : (
        <FlatList
          data={publicItems}            
          style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
          renderItem={({ item }) => (
            <View style={{ width: width - 32, alignSelf: 'center', marginVertical: 8, marginRight: 16 }}>
              <PublicItem item={item} />
            </View>
          )}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={width - 32 + 16} // container width plus marginHorizontal on right
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.publicList}
        />
      )}
      {/* ...existing code if any... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Make the wash button circular while keeping its size
  washButton: {
    backgroundColor: '#4160fb',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  washText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeContainer: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    // Added shadow for better appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  completeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  publicList: {
    paddingVertical: 10,
  },
  emptyPublicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  emptyPublicText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});