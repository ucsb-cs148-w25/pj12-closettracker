import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getCountFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import PublicItem from '@/components/PublicItem';
import { useUser } from '@/context/UserContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentUser: user } = useUser();
  const [laundryCount, setLaundryCount] = useState(0);
  const [clothingCount, setClothingCount] = useState(0);
  const [publicItems, setPublicItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const db = getFirestore();

  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const completeOpacity = useRef(new Animated.Value(0)).current;

  
  const fetchCounts = async (uid: string) => {
    try {
      const laundrySnapshot = await getCountFromServer(
        collection(db, 'users', uid, 'laundry')
      );
      const clothingSnapshot = await getCountFromServer(
        collection(db, 'users', uid, 'clothing')
      );

      return {
        laundryCount: laundrySnapshot.data().count,
        clothingCount: clothingSnapshot.data().count,
      };
    } catch (error) {
      console.error('Error fetching counts:', error);
      return {
        laundryCount: 0,
        clothingCount: 0,
      };
    }
  };

  
  useEffect(() => {
    if (!user) return;

    const updateCounts = async () => {
      const counts = await fetchCounts(user.uid); 
      if (!loading) {
        setLaundryCount(counts.laundryCount);
        setClothingCount(counts.clothingCount);
      }
    };

    updateCounts();

    
    const publicRef = collection(db, 'public');
    const publicQuery = query(publicRef, orderBy('likesCount', 'desc'));
    const unsubscribePublic = onSnapshot(publicQuery, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPublicItems(items);
    });

    
    const unsubscribeLaundry = onSnapshot(
      collection(db, 'users', user.uid, 'laundry'),
      updateCounts
    );
    const unsubscribeClothing = onSnapshot(
      collection(db, 'users', user.uid, 'clothing'),
      updateCounts
    );

    return () => {
      unsubscribePublic();
      unsubscribeLaundry();
      unsubscribeClothing();
    };
  }, [user, db, loading]);

  
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

  
  const handleWash = async () => {
    if (!user) return;
    setLoading(true);
    startRotation();

    try {
      const laundryRef = collection(db, 'users', user.uid, 'laundry');
      const laundrySnapshot = await getDocs(laundryRef);

      const promises = laundrySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const clothingDocRef = doc(db, 'users', user.uid, 'clothing', docSnap.id);
        const newData = { ...data, wearCount: 0 };

        await setDoc(clothingDocRef, newData);
        await deleteDoc(doc(db, 'users', user.uid, 'laundry', docSnap.id));
      });

      await Promise.all(promises);

      const counts = await fetchCounts(user.uid);

      stopRotation();
      setLoading(false);

      setLaundryCount(counts.laundryCount);
      setClothingCount(counts.clothingCount);

      completeOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(completeOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(completeOpacity, {
          toValue: 0,
          duration: 1000,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error washing items:', error);
      stopRotation();
      setLoading(false);
    }
  };

  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{laundryCount}</Text>
          <Text>Laundry Items</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{clothingCount}</Text>
          <Text>Clean Clothes</Text>
        </View>
        <TouchableOpacity
          style={styles.washButton}
          onPress={handleWash}
          disabled={loading}
        >
          <Animated.Text
            style={[
              styles.washText,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            Wash
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.completeContainer, { opacity: completeOpacity }]}>
        <Text style={styles.completeText}>Washing Complete!</Text>
      </Animated.View>

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
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={width - 32 + 16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.publicList}
        />
      )}
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
  washButton: {
    backgroundColor: '#4160fb',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#000',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 255, 100, 0.7)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  completeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
