import { ClothingItem } from '@/components/ClothingItem';
import { MultiSelectActions } from '@/components/MultiSelectActions';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, FlatList, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, } from 'react-native-safe-area-context';
import SearchBar from '@/components/searchBar';


export default function createOutfit() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectMode, setSelectMode] = useState(true);
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
            router.push(`../(screens)/singleItem?item=${itemId}&collections=clothing`);
        }
    };

    const handleItemLongPress = (itemId: string) => {
        if (!selectMode) {
            setSelectMode(true);
            setSelectedIds([itemId]);
        }
    };

    const handleAddOutfit = () => {
        if (selectedIds.length === 0) return;
        router.push(`../(screens)/canvas?item=${JSON.stringify(selectedIds)}`);
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    }

    const filteredItems = items.filter((item) =>
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
                            showCancel={false}
                            handleCancelSelection={() => {}}
                            handleAddOutfit={handleAddOutfit}
                            handleEdit={() => {}}
                            showEdit={false}
                            handleDeleteSelected={async () => {}}
                            showDelete={false}
                        />
                    ) : (
                        <Text style={styles.title}>Select Clothing Items</Text>
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
                            {searchQuery ? "No items found." : "Your wardrobe is empty."}
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
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <IconSymbol name={"arrow.uturn.backward"} color={"#4160fb"} />
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
        //width: '100%',
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
    backButton: {
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
        right: 20
    }
});