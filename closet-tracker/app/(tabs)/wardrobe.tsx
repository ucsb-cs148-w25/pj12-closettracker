import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';

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
  const [refreshing, setRefreshing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();

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
      if (selectedIds.length === 1 && selectedIds[0] === itemId) {
        handleCancelSelection();
      }
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

  const handleDeleteSelected = async () => {
    if (!user || selectedIds.length === 0) return;

    try {
      handleCancelSelection();
      const promises = selectedIds.map((id) =>
        deleteDoc(doc(db, "users", user.uid, "clothing", id))
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const handleLaundrySelected = async () => {
    if (!user || selectedIds.length === 0) 
      router.push("../(screens)/laundry"); // Exit if no user or no items selected
  
    try {
      handleCancelSelection(); // Exit selection mode
  
      // Move items from "wardrobe" to "laundry"
      const promises = selectedIds.map(async (id) => {
        const wardrobeRef = doc(db, "users", user.uid, "clothing", id); // Reference to wardrobe item
        const laundryRef = doc(db, "users", user.uid, "laundry", id);  // Reference to laundry item
  
        // Fetch wardrobe item data
        const itemSnapshot = await getDoc(wardrobeRef);
        if (itemSnapshot.exists()) {
          console.log("Moving item:", itemSnapshot.data());
          // Move the item to the laundry collection
          await setDoc(laundryRef, itemSnapshot.data());
          // Remove the item from the wardrobe collection
          await deleteDoc(wardrobeRef);
        } else{
          console.log(`Item with ID ${id} does not exist in wardrobe.`);
        }
      });
  
      // Wait for all items to be moved
      await Promise.all(promises);
  
      // Navigate to the laundry screen after moving items
      router.push("../(screens)/laundry");
    } catch (error) {
      console.error("Error moving items:", error);
    }
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  }

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <View style={styles.header}>
          {selectMode ? (
            <View style={styles.iconContainer}>
              <Pressable onPress={handleCancelSelection}>
                <IconSymbol name="xmark.app" color="gray" size={28} />
              </Pressable>

              <View style={styles.deleteIconWrapper}>
                <Pressable onPress={handleDeleteSelected}>
                  <IconSymbol name="trash" color="red" size={28} />
                  {selectedIds.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{selectedIds.length}</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.title}>Wardrobe</Text>
          )}
        </View>

        <View style={styles.searchContainer}>
          <TextInput 
            placeholder='Search'
            placeholderTextColor={'#ccc'}
            clearButtonMode='never'
            style={styles.searchBox}
            autoCapitalize='none'
            autoCorrect={false}
            value={searchQuery}
            onChangeText={(query) => handleSearch(query)}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <IconSymbol name="xmark.circle" color="#ccc" size={20}/>
            </Pressable>
          )}
        </View>

        {filteredItems.length === 0 && !refreshing ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.emptyMessage}>
              {searchQuery ? "No items found." : "Your wardrobe is empty."}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.clothesContainer}
            style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
            data={filteredItems}
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
                colors={['#4160fb']}
                tintColor="#4160fb"
              />
            }
          />
        )}
        <TouchableOpacity
          style={styles.laundryButton}
          onPress={handleLaundrySelected}>
            <IconSymbol name={"archivebox.fill"} color={"#4160fb"} />        
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
  emptyMessage: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  deleteIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBox: {
    paddingHorizontal:20,
    paddingVertical:10,
    borderColor:'#ccc',
    borderWidth:1,
    borderRadius:8,
    width:'95%',
  },
  searchContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    position: 'absolute',
    right:10,
    padding:10,
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
    right: 50
  }
});
