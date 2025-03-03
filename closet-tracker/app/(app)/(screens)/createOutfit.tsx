import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, View, RefreshControl, Pressable, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ClothingItem } from '@/components/ClothingItem';
import { MultiSelectActions } from '@/components/MultiSelectActions';
import SearchBar from '@/components/searchBar';
import FilterModal from '@/components/FilterModal';
import { useUser } from '@/context/UserContext';

export default function createOutfit() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(true);
    const { currentUser : user } = useUser();
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
    
    const handleItemPress = (itemId: string) => {
        setSelectedIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

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
            setItems([]); // Clear items if logged out
            setRefreshing(false);
        }
    }, [user]);
    
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

    const handleAddOutfit = () => {
        if (selectedIds.length === 0) return;
        router.push(`../(screens)/canvas?item=${JSON.stringify(selectedIds)}`);
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    }

    const renderItem = ({ item }: { item: any }) => {
        if (item.id === "\"STUB\"") return <View style={{ flex: 1, aspectRatio: 1, margin: 8 }} />;
        const isSelected = selectedIds.includes(item.id);
        const backgroundColor = isSelected ? '#4160fb' : '#a5b4fd';
        const textColor = isSelected ? 'white' : 'black';

        return (
            <ClothingItem
                item={item}
                onPress={() => handleItemPress(item.id)}
                onLongPress={() => {}}
                backgroundColor={backgroundColor}
                textColor={textColor}
            />
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <MultiSelectActions
                        selectedIds={selectedIds}
                        showCancel={false}
                        handleCancelSelection={() => {}}
                        handleAddOutfit={handleAddOutfit}
                        handleEdit={() => {}}
                        showEdit={false}
                        handleDeleteSelected={async () => {}}
                        showDelete={false}
                    />
                </View>

                <View style={styles.nonSelectHeader}>
                    <SearchBar
                        searchQuery={searchQuery}
                        handleSearch={handleSearch}
                        clearSearch={() => setSearchQuery('')}
                    />
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
                        style={{ height: '100%' }}
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
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <IconSymbol name={"arrow.uturn.backward"} color={"#4160fb"} />
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
        marginRight: 10,
        marginBottom: 10,
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
    backButton: {
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