import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, Button, View, Image, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { useRouter } from 'expo-router';

type ItemType = {
  id: string;
  itemName: string;
  image: string;
};

type ItemProps = {
  item: ItemType;
  onPress: () => void;
  onLongPress: () => void;
  backgroundColor: string;
  textColor: string;
};

const Item = ({ item, onPress, onLongPress, backgroundColor, textColor }: ItemProps) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.item, { backgroundColor }]}>
    {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />}
    <Text style={[styles.itemText, { color: textColor }]}>{item.itemName}</Text>
  </TouchableOpacity>
);

export default function WardrobeScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(true); // Used for both initial load and pull-to-refresh
  const [user, setUser] = useState<any>(null);

  const auth = getAuth();
  const db = getFirestore();

  // Fetch wardrobe items
  const fetchItems = useCallback(() => {
    if (user) {
      const itemsRef = collection(db, "users", user.uid, "clothing");
      const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(fetchedItems);
        setRefreshing(false);
      });
      return unsubscribe;
    } else {
      setItems([]); // Clear items if logged out
      setRefreshing(false);
    }
  }, [user]);

  // Handle authentication changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setRefreshing(true);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch items when user changes
  useEffect(() => {
    const unsubscribe = fetchItems();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchItems]);

  const handleItemPress = (itemId: string) => {
    if (selectMode) {
      setSelectedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      router.push(`../(screens)/singleItem?item=${itemId}`);
    }
  };

  const handleItemLongPress = (itemId: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([itemId]);
    }
  };

  const handleCancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    const backgroundColor = isSelected ? '#4160fb' : '#a5b4fd';
    const textColor = isSelected ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => handleItemPress(item.id)}
        onLongPress={() => handleItemLongPress(item.id)}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {!user ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.loginMessage}>Please log in first</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Wardrobe</Text>
              {selectMode && (
                <Button title="Cancel Selection" onPress={handleCancelSelection} color="red" />
              )}
            </View>

            <FlatList
              contentContainerStyle={styles.clothesContainer}
              style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              extraData={selectedIds}
              numColumns={2}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchItems();
                  }}
                  colors={['#4160fb']} // For Android pull-to-refresh color
                  tintColor="#4160fb" // For iOS pull-to-refresh color
                />
              }
            />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  clothesContainer: {
    alignItems: 'stretch',
    justifyContent: "center",
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    width: '45%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#a5b4fd',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemImage: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
    marginBottom: 8,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
});
