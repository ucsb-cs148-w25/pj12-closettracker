import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme, Modal, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, orderBy, query, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ClothingItem } from "@/components/ClothingItem";
import { MultiSelectActions } from "@/components/MultiSelectActions";
import SearchBar from "@/components/searchBar";
import FilterModal from '@/components/FilterModal';
import { useUser } from '@/context/UserContext';

export default function WardrobeScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const { currentUser: user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<{
    size: string | null;
    color: string | null;
    clothingType: string | null;
    brand: string;
    notes: string;
  }>({
    size: null,
    color: null,
    clothingType: null,
    brand: '',
    notes: '',
  });
  const [originalFilters, setOriginalFilters] = useState(filters);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const db = getFirestore();

  // Fetch wardrobe items
  const fetchItems = useCallback(() => {
    if (user) {
      const itemsRef = collection(db, "users", user.uid, "clothing");
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
      console.log("No user found. Clearing wardrobe items.");
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

  // Define a custom order for sizes
  const sizeOrder: { [key: string]: number } = { xs: 0, s: 1, m: 2, l: 3, xl: 4 };

  // Compute dynamic filter options from data
  const availableSizes = Array.from(new Set(items.map(item => item.size).filter(Boolean)));
  const sortedAvailableSizes = availableSizes.sort(
    (a, b) => (sizeOrder[a.toLowerCase()] ?? Infinity) - (sizeOrder[b.toLowerCase()] ?? Infinity)
  );
  const availableColors = Array.from(new Set(items.map(item => item.color).filter(Boolean)));
  const availableClothingTypes = Array.from(new Set(items.map(item => item.clothingType).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = filters.size
      ? (item.size ? item.size.toLowerCase() === filters.size.toLowerCase() : false)
      : true;
    const matchesColor = filters.color
      ? (item.color ? item.color.toLowerCase() === filters.color.toLowerCase() : false)
      : true;
    const matchesClothingType = filters.clothingType
      ? (item.clothingType ? item.clothingType.toLowerCase() === filters.clothingType.toLowerCase() : false)
      : true;
    const matchesBrand = filters.brand
      ? (item.brand ? item.brand.toLowerCase().includes(filters.brand.toLowerCase()) : false)
      : true;
    const matchesNotes = filters.notes
      ? (item.notes ? item.notes.toLowerCase().includes(filters.notes.toLowerCase()) : false)
      : true;
    return matchesSearch && matchesSize && matchesColor && matchesClothingType && matchesBrand && matchesNotes;
  });

  const handleItemPress = (itemId: string) => {
    if (selectMode) {
      setSelectedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
      if (selectedIds.length === 1 && selectedIds[0] === itemId) {
        handleCancelSelection();
      }
    } else {
      router.push(`../(screens)/singleItem?item=${itemId}&collections=clothing`);
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

  const handleEdit = () => {
    if (!user || selectedIds.length !== 1) return;
    router.push(`../(screens)/editItem?item_id=${selectedIds[0]}&collections=clothing`);
  };

  const handleLaundrySelected = async () => {
    if (!user) return;
    if (selectedIds.length === 0) {
      router.push("../(screens)/laundry"); // Exit if no user or no items selected
      return;
    }

    try {
      handleCancelSelection(); // Exit selection mode

      // Move items from "wardrobe" to "laundry"
      const promises = selectedIds.map(async (id) => {
        const wardrobeRef = doc(db, "users", user.uid, "clothing", id); // Reference to wardrobe item
        const laundryRef = doc(db, "users", user.uid, "laundry", id);  // Reference to laundry item

        // Fetch wardrobe item data
        const itemSnapshot = await getDoc(wardrobeRef);
        if (itemSnapshot.exists()) {
          // Move the item to the laundry collection
          await setDoc(laundryRef, itemSnapshot.data());
          // Remove the item from the wardrobe collection
          await deleteDoc(wardrobeRef);
        } else {
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
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === "\"STUB\"") return <View style={{ flex: 1, aspectRatio: 1, margin: 8 }} />;
    const isSelected = selectedIds.includes(item.id);
    // const backgroundColor = isSelected ? '#4160fb' : '#a5b4fd';
    const getBackgroundColor = (wearCount: number, isSelected: boolean) => {
      if (isSelected) return '#4160fb'; // Blue when selected

      // Normalize wearCount to a range (e.g., 0 to 10 or 20)
      const maxWearCount = 10;
      const normalizedCount = Math.min(wearCount, maxWearCount) / maxWearCount;

      // Interpolate lightness from 75% (light beige) to 30% (dark brown)
      const lightness = 75 - normalizedCount * 45;

      return `hsl(30, 50%, ${lightness}%)`; // HSL with a brownish hue
    };

    // Usage
    const backgroundColor = getBackgroundColor(item.wearCount, isSelected);
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
              handleAddOutfit={() => { }}
              showAddOutfit={false}
              handleEdit={handleEdit}
              handleDeleteSelected={handleDeleteSelected}
            />
          ) : (
            <View style={styles.nonSelectHeader}>
              <Text style={styles.title}>Wardrobe</Text>
              <Pressable
                onPress={() => {
                  setOriginalFilters(filters); // store current filters in case of cancel
                  setFilterModalVisible(true);
                }}
                style={styles.filterIcon}
              >
                <IconSymbol name="line.horizontal.3.decrease.circle" color="gray" size={28} />
              </Pressable>
            </View>
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
              {searchQuery || filters.size || filters.color || filters.clothingType || filters.brand || filters.notes
                ? "No items found."
                : "Your wardrobe is empty."}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.clothesContainer}
            style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0, height: '100%' }}
            data={filteredItems.length % 2 === 1 ? [...filteredItems, { id: "\"STUB\"" }] : filteredItems}
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
          <IconSymbol name={"washer.fill"} color={"#fff"} />
          <Text style={{color:"#fff"}}> Laundry </Text>
        </TouchableOpacity>

        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <FilterModal
            setFilters={setFilters}
            filters={filters}
            originalFilters={originalFilters}
            setFilterModalVisible={setFilterModalVisible}
            sortedAvailableSizes={sortedAvailableSizes}
            availableColors={availableColors}
            availableClothingTypes={availableClothingTypes}
          />
        </Modal>
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
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  nonSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterIcon: {
    padding: 5,
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#9e9785',
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