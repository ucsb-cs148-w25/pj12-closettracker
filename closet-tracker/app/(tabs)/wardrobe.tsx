import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, Modal } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, orderBy, query, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TextInput } from 'react-native-gesture-handler';

type ItemType = {
  id: string;
  itemName: string;
  image: string;
  // metadata fields
  size?: string;
  color?: string;
  clothingType?: string;
  brand?: string;
  notes?: string;
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
  const [items, setItems] = useState<ItemType[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // new state for filters
  const [filterModalVisible, setFilterModalVisible] = useState(false);
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

  const auth = getAuth();
  const db = getFirestore();

  // Fetch wardrobe items
  const fetchItems = useCallback(() => {
    if (user) {
      const itemsRef = collection(db, "users", user.uid, "clothing");
      const q = query(itemsRef, orderBy("dateUploaded", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() } as ItemType;
        });
        setItems(fetchedItems);
        setRefreshing(false);
      });
      return unsubscribe;
    } else {
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
  }, [auth]);

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

  const handleAddOutfit = () => {
    if (selectedIds.length === 0) return;
    router.push(`../(screens)/canvas?item=${JSON.stringify(selectedIds)}`);
  }
    
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
  }

  // filtering ON TOP of search
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
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
      ? (item.brand
          ? item.brand.toLowerCase().includes(filters.brand.toLowerCase())
          : false)
      : true;
    
    const matchesNotes = filters.notes
      ? (item.notes
          ? item.notes.toLowerCase().includes(filters.notes.toLowerCase())
          : false)
      : true;
    
    return (
      matchesSearch &&
      matchesSize &&
      matchesColor &&
      matchesClothingType &&
      matchesBrand &&
      matchesNotes
    );
  });

  const renderItem = ({ item }: { item: ItemType }) => {
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

              <Pressable onPress={handleAddOutfit}>
                <IconSymbol name="pencil.and.list.clipboard" color="green" size={28} />
              </Pressable>

              { selectedIds.length === 1 ? (
                <Pressable onPress={handleEdit}>
                  <IconSymbol name="pencil" color="gray" size={28} />
                </Pressable>
              ) : null }

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
            <View style={styles.nonSelectHeader}>
              <Text style={styles.title}>Wardrobe</Text>
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                style={styles.filterIcon}
              >
                <IconSymbol
                  name="line.horizontal.3.decrease.circle"
                  color="gray"
                  size={28}
                />
              </Pressable>
            </View>
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
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle" color="#ccc" size={20} />
            </Pressable>
          )}
        </View>

        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <Pressable onPress={() => {setFilters({ size: null, color: null, clothingType: null, brand: '', notes: '' }); setFilterModalVisible(false);}} style={styles.exitButtonModal}>
                <IconSymbol name="xmark.circle" color="#ccc" size={28} />
              </Pressable>
              <Text style={styles.filterLabel}>Size</Text>
              <View style={styles.filterGroup}>
                {['xs', 's', 'm', 'l', 'xl'].map((size) => (
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
                    <Text style={styles.filterOptionText}>
                      {size.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.filterLabel}>Color</Text>
              <View style={styles.filterGroup}>
                {['red', 'orange', 'yellow', 'pink', 'purple'].map((color) => (
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
                {['t-shirt', 'top', 'jeans', 'trousers', 'shorts'].map(
                  (type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.filterOption,
                        filters.clothingType === type && styles.selectedOption,
                      ]}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          clothingType:
                            filters.clothingType === type ? null : type,
                        })
                      }
                    >
                      <Text style={styles.filterOptionText}>{type}</Text>
                    </Pressable>
                  )
                )}
              </View>
              <Text style={styles.filterLabel}>Brand</Text>
              <TextInput
                placeholder="Enter brand"
                placeholderTextColor="#ccc"
                style={styles.filterTextInput}
                value={filters.brand}
                onChangeText={(text) =>
                  setFilters({ ...filters, brand: text })
                }
              />
              <Text style={styles.filterLabel}>Notes</Text>
              <TextInput
                placeholder="Enter notes"
                placeholderTextColor="#ccc"
                style={styles.filterTextInput}
                value={filters.notes}
                onChangeText={(text) =>
                  setFilters({ ...filters, notes: text })
                }
              />
              <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setFilterModalVisible(false)}
                >
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
          <IconSymbol name={"archivebox.fill"} color={"#fff"} />        
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
  exitButtonModal: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  clearButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
