import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme, Modal, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, orderBy, query, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ClothingItem } from "@/components/ClothingItem";
import { MultiSelectActions } from "@/components/MultiSelectActions";
import SearchBar from "@/components/searchBar";

export default function WardrobeScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();

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

  const auth = getAuth();
  const db = getFirestore();

  // Fetch wardrobe items
  const fetchItems = useCallback(() => {
    if (user) {
      console.log("Fetching wardrobe items for user:", user.uid);
      const itemsRef = collection(db, "users", user.uid, "clothing");
      const q = query(itemsRef, orderBy("dateUploaded", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Wardrobe items fetched:", fetchedItems);
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
      fetchItems();
    }, [fetchItems])
  );

  const availableSizes = Array.from(new Set(items.map(item => item.size).filter(Boolean)));
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
  };

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
          <IconSymbol name={"archivebox.fill"} color={"#fff"} />        
        </TouchableOpacity>

        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <Pressable 
                onPress={() => {
                  // cancel filtering – revert to the original filters
                  setFilters(originalFilters);
                  setFilterModalVisible(false);
                }} 
                style={styles.exitButtonModal}
              >
                <IconSymbol name="xmark.circle" color="#ccc" size={28} />
              </Pressable>

              <Text style={styles.filterLabel}>Size</Text>
              <View style={styles.filterGroup}>
                {availableSizes.map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.filterOption,
                      filters.size === size && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        size: filters.size === size ? null : size,
                      })
                    }
                  >
                    <Text style={styles.filterOptionText}>{size.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.filterLabel}>Color</Text>
              <View style={styles.filterGroup}>
                {availableColors.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.filterOption,
                      filters.color === color && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        color: filters.color === color ? null : color,
                      })
                    }
                  >
                    <Text style={styles.filterOptionText}>{color}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.filterLabel}>Clothing Type</Text>
              <View style={styles.filterGroup}>
                {availableClothingTypes.map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.clothingType === type && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        clothingType: filters.clothingType === type ? null : type,
                      })
                    }
                  >
                    <Text style={styles.filterOptionText}>{type}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.filterLabel}>Brand</Text>
              <TextInput
                placeholder="Enter brand"
                placeholderTextColor="#ccc"
                style={styles.filterTextInput}
                value={filters.brand}
                onChangeText={(text) => setFilters({ ...filters, brand: text })}
              />

              <Text style={styles.filterLabel}>Notes</Text>
              <TextInput
                placeholder="Enter notes"
                placeholderTextColor="#ccc"
                style={styles.filterTextInput}
                value={filters.notes}
                onChangeText={(text) => setFilters({ ...filters, notes: text })}
              />

              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity style={styles.applyButton} onPress={() => setFilterModalVisible(false)}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButtonModal}
                  onPress={() =>
                    setFilters({
                      size: null,
                      color: null,
                      clothingType: null,
                      brand: '',
                      notes: '',
                    })
                  }
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    bottom: 100,
    right: 20,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exitButtonModal: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  filterLabel: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  filterOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: '#4160fb',
    borderColor: '#4160fb',
  },
  filterOptionText: {
    color: '#000',
  },
  filterTextInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: '#4160fb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButtonModal: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
