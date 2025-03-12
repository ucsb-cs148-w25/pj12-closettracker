import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, RefreshControl } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ClothingItem } from '@/components/ClothingItem';
import { MultiSelectActions } from '@/components/MultiSelectActions';
import SearchBar from '@/components/searchBar';
import { useUser } from '@/context/UserContext';

export default function OutfitScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const { currentUser: user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const db = getFirestore();

  // Fetch outfit items
  const fetchItems = useCallback(() => {
    if (user) {
      const itemsRef = collection(db, "users", user.uid, "outfit");
      const q = query(itemsRef, orderBy("dateUploaded", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
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
  }, [user, db]);

  // Fetch items when user changes
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
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
      router.push(`../(screens)/singleItem?item=${itemId}&collections=outfit`);
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
        deleteDoc(doc(db, "users", user.uid, "outfit", id))
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const handleEdit = () => {
    if (!user || selectedIds.length !== 1) return;
    router.push(`../(screens)/canvas?outfitId=${selectedIds[0]}`)
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  }

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === "\"STUB\"") return <View style={{ flex: 1, aspectRatio: 1, margin: 8 }} />;
    const isSelected = selectedIds.includes(item.id);

    // Usage
    const backgroundColor = isSelected ? '#4160fb' : `hsl(30, 50%, 90%)`;
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
            <Text style={styles.title}>Outfits</Text>
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
              {searchQuery ? "No items found." : "Your don't have any outfits."}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.clothesContainer}
            style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0, height: '100%' }}
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
                  fetchItems();
                }}
                colors={['#4160fb']}
                tintColor="#4160fb"
              />
            }
          />
        )}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("../(screens)/createOutfit")}>
          <IconSymbol name={"plus"} color={"#fff"} />
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
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#4160fb',
    borderRadius: 50,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 50,
    right: 20,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
});