import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { auth } from '@/FirebaseConfig';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

export default function LaundryScreen() {
  const [laundryItems, setLaundryItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const router = useRouter();
  const db = getFirestore();
  const user = auth.currentUser;

  const fetchLaundryItems = useCallback(async () => {
    if (user) {
      const laundryRef = collection(db, "users", user.uid, "laundry");
      const snapshot = await getDocs(laundryRef);

      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLaundryItems(fetchedItems);
      setRefreshing(false);
    } else {
      setLaundryItems([]);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLaundryItems();
  }, [fetchLaundryItems]);

  const handleMoveToWardrobe = async () => {
    if (!user) return;
    if (selectedIds.length === 0) {
      router.replace("../(tabs)/wardrobe");
      return;
    }
    try {
      setSelectMode(false);
      setSelectedIds([]);
      
      const promises = selectedIds.map(async (id) => {
        const laundryRef = doc(db, "users", user.uid, "laundry", id);
        const wardrobeRef = doc(db, "users", user.uid, "clothing", id);
        const itemSnapshot = await getDoc(laundryRef);
        
        if (itemSnapshot.exists()) {
          await setDoc(wardrobeRef, itemSnapshot.data());
          await deleteDoc(laundryRef);
        }
      });
  
      await Promise.all(promises);
  
      // Navigate back and trigger wardrobe refresh
      router.replace("../(tabs)/wardrobe");
  
    } catch (error) {
      console.error("Error moving items:", error);
    }
  };

  const filteredItems = laundryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const backgroundColor = '#a5b4fd';
    const textColor = 'black';

    return (
      <Item
        item={item}
        onPress={() => console.log(`Item pressed: ${item.id}`)}
        onLongPress={() => console.log(`Item long-pressed: ${item.id}`)}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          contentContainerStyle={styles.clothesContainer}
          data={laundryItems}
          renderItem={({ item }) => (
            <Item
              item={item}
              onPress={() => {
                if (selectMode) {
                  setSelectedIds((prev) =>
                    prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                  );
                }
              }}
              onLongPress={() => {
                if (!selectMode) {
                  setSelectMode(true);
                  setSelectedIds([item.id]);
                }
              }}
              backgroundColor={selectedIds.includes(item.id) ? '#4160fb' : '#a5b4fd'}
              textColor={selectedIds.includes(item.id) ? 'white' : 'black'}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLaundryItems} />}
        />
          <TouchableOpacity 
            style={styles.laundryButton} 
            onPress={handleMoveToWardrobe}>
            <IconSymbol name="tshirt.fill" color="#4160fb" />
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
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '95%',
  },
  searchContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
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
    right: 50
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