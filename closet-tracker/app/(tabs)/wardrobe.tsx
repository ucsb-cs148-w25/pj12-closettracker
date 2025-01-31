import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, Button, View, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import { useRouter } from 'expo-router';

// export type ItemData = {
//   id: string;
//   title: string;
//   wearCount: number;
//   lastWorn: string;
// };
  // export type ItemData = {
  //   id: string;
  //   title: string;
  // };

// export const DATA: ItemData[] = [
//   { id: '1', title: 'Shirt', wearCount: 3, lastWorn: '2025-01-20T12:00:00Z' },
//   { id: '2', title: 'Cardigan', wearCount: 3, lastWorn: '2025-01-19T12:00:00Z' },
//   { id: '3', title: 'Pants', wearCount: 3, lastWorn: '2025-01-22T12:00:00Z' },
//   { id: '4', title: 'Jacket', wearCount: 2, lastWorn: '2025-01-18T12:00:00Z' },
//   { id: '5', title: 'Sweater', wearCount: 5, lastWorn: '2025-01-21T12:00:00Z' },
//   { id: '6', title: 'Jeans', wearCount: 4, lastWorn: '2025-01-15T12:00:00Z' },
//   { id: '11', title: 'Shirt', wearCount: 3, lastWorn: '2025-01-20T12:00:00Z' },
//   { id: '12', title: 'Cardigan', wearCount: 3, lastWorn: '2025-01-19T12:00:00Z' },
//   { id: '13', title: 'Pants', wearCount: 3, lastWorn: '2025-01-22T12:00:00Z' },
//   { id: '14', title: 'Jacket', wearCount: 2, lastWorn: '2025-01-18T12:00:00Z' },
//   { id: '15', title: 'Sweater', wearCount: 5, lastWorn: '2025-01-21T12:00:00Z' },
//   { id: '16', title: 'Jeans', wearCount: 4, lastWorn: '2025-01-15T12:00:00Z' },
// ];
type ItemType = {
  id: string;
  itemName: string;
  image: string
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
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   console.log('Selected IDs:', selectedIds);
  // }, [selectedIds]);
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      console.log("No user logged in");
      return;
    }

    const itemsRef = collection(db, "users", user.uid, "clothing");
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleItemPress = (itemId: string) => {
    if (selectMode) {
      setSelectedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      router.push(`../(screens)/ClothingTracker?item=${itemId}`);
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
        />
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
  // clothesContainer: {
  //   alignItems: 'center',
  // },
  clothesContainer: {
    alignItems: 'stretch',
    justifyContent: "center",
  },
  // item: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   margin: 8,
  //   width: '45%',
  //   height: 200,
  //   borderRadius: 10,
  //   backgroundColor: '#a5b4fd',
  // },
  item: {
    // flex: 1,
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
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "100",
  },
  itemImage: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
    marginBottom: 8,
  },
});
