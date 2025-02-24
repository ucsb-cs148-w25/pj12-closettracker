import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, orderBy, query, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ClothingItem } from '@/components/ClothingItem';
import { MultiSelectActions } from '@/components/MultiSelectActions';
import SearchBar from '@/components/searchBar';

export default function LaundryScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const [laundryItems, setLaundryItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const auth = getAuth();
  const db = getFirestore();

  const fetchLaundryItems = useCallback(() => {
    if (user) {
      const laundryRef = collection(db, "users", user.uid, "laundry");
      const q = query(laundryRef, orderBy("dateUploaded", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLaundryItems(fetchedItems);
        setRefreshing(false);
      });

      return unsubscribe;
    } else {
      console.log("No user found. Clearing wardrobe items.");
      setLaundryItems([]); // Clear items if logged out
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
  useFocusEffect(
    useCallback(() => {
      fetchLaundryItems();
    }, [fetchLaundryItems])
  );

  const handleItemPress = (itemId: string) => {
    if (selectMode) {
      setSelectedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
      if (selectedIds.length === 1 && selectedIds[0] === itemId) {
        handleCancelSelection();
      }
    } else {
      router.push(`../(screens)/singleItem?item=${itemId}&collections=laundry`);
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

  const handleDeleteSelected = async () => {
    if (!user || selectedIds.length === 0) return;

    try {
      handleCancelSelection();
      const promises = selectedIds.map((id) =>
        deleteDoc(doc(db, "users", user.uid, "laundry", id))
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const handleEdit = () => {
    if (!user || selectedIds.length !== 1) return;
    router.push(`../(screens)/editItem?item_id=${selectedIds[0]}&collections=laundry`);
  };

  const handleMoveToWardrobe = async () => {
    if (!user) return;
    if (selectedIds.length === 0) {
      router.replace("../(tabs)/wardrobe");
      return;
    }
    try {
      handleCancelSelection();
      
      const promises = selectedIds.map(async (id) => {
        const wardrobeRef = doc(db, "users", user.uid, "clothing", id);
        const laundryRef = doc(db, "users", user.uid, "laundry", id);
        const itemSnapshot = await getDoc(laundryRef);
        
        if (itemSnapshot.exists()) {
          await setDoc(wardrobeRef, itemSnapshot.data());
          await deleteDoc(laundryRef);
        } else{
          console.log(`Item with ID ${id} does not exist in laundry.`);
        }
      });
  
      await Promise.all(promises);
  
      // Navigate back and trigger wardrobe refresh
      router.replace("../(tabs)/wardrobe");
  
    } catch (error) {
      console.error("Error moving items:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  }
  const filteredItems = laundryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === "\"STUB\"") return <View style={{ flex: 1, aspectRatio: 1, margin: 8 }} />;
    const isSelected = selectedIds.includes(item.id);
    const backgroundColor = isSelected ? '#4160fb' : '#a5b4fd';
    const textColor = isSelected ? 'white' : 'black';

    return (
      <ClothingItem
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
        <View style={styles.header}>
          {selectMode ? (
            <MultiSelectActions
              selectedIds={selectedIds}
              handleCancelSelection={handleCancelSelection}
              handleAddOutfit={() => {}}
              showAddOutfit={false}
              handleEdit={handleEdit}
              handleDeleteSelected={handleDeleteSelected}
            />
          ) : (
            <Text style={styles.title}>Laundry</Text>
          )}
        </View>

        <SearchBar
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          clearSearch={() => setSearchQuery('')}
        />

        {filteredItems.length === 0 && !refreshing ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.emptyMessage}>
              {searchQuery ? "No items found." : "Your laundry bin is empty."}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.clothesContainer}
            style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
            data={filteredItems.length % 2 === 1 ? [...filteredItems, {id: "\"STUB\""}] : filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            extraData={selectedIds}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchLaundryItems();
                }}
                colors={['#4160fb']}
                tintColor="#4160fb"
              />
            }
          />
        )}
        <TouchableOpacity
          style={styles.laundryButton}
          onPress={handleMoveToWardrobe}>
          <IconSymbol name={"tshirt.fill"} color={"#4160fb"} />
        </TouchableOpacity>
        
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
    paddingHorizontal: 15,
  },
  clothesContainer: {
    alignItems: 'stretch',
    justifyContent: "center",
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  laundryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 50,
    position: 'absolute',
    bottom: 100,
    right: 20,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
});
