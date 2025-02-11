import { StyleSheet, FlatList, Text, TouchableOpacity, Platform, View, Image, RefreshControl, Pressable, useColorScheme } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useRouter } from 'expo-router';
import { auth } from '@/FirebaseConfig';
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

export default function LaundryScreen() {
  const [laundryItems, setLaundryItems] = useState<any[]>([]);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
        <View style={styles.header}>
          <Text style={styles.title}>Laundry</Text>
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
              {searchQuery ? "No items found." : "Your laundry is empty."}
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.clothesContainer}
            style={{ marginBottom: Platform.OS === 'ios' ? 50 : 0 }}
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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
          style={styles.backButton}
          onPress={() => router.replace("../(tabs)/wardrobe")}
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
  }
});