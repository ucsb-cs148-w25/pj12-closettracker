import { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView, View, StyleSheet, Text, Image } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { SharedValue } from "react-native-reanimated";

export default function CanvasScreen() {
  const param = useLocalSearchParams();
  const itemIds = JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const [itemUri, setItemUri] = useState<{ id: string; uri: string; name: string }[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) return;

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in!");
        return;
      }

      try {
        const ClothingRef = collection(db, "users", user.uid, "clothing");
        const q = query(ClothingRef, where("__name__", "in", itemIds));
        const querySnapshot = await getDocs(q);

        const fetchedImages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          uri: doc.data().image,
          name: doc.data().itemName,
        }));

        setItemUri(fetchedImages);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const renderItem = (params: RenderItemParams<{ id: string; uri: string; name: string }>) => {
    return (
      <ScaleDecorator>
        <View style={styles.layerItem} onTouchStart={params.drag}>
          <Image source={{ uri: params.item.uri }} style={styles.layerImage} />
          <Text style={styles.layerText}>{params.item.name}</Text>
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Canvas with clothing items */}
      <View style={styles.canvas}>
        {itemUri.map(({ id, uri }) => (
          <DraggableResizableImage key={id} uri={uri}/>
        ))}
      </View>

      {/* Draggable Layer List (Horizontal) */}
      <View style={styles.layerContainer}>
        <Text style={styles.layerTitle}>Adjust Layer Order</Text>
        <DraggableFlatList
          horizontal
          data={itemUri}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setItemUri(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  canvas: {
    flex: 1,
    position: "relative",
  },
  layerContainer: {
    height: 120, // Reduced height for better UX
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  layerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  layerItem: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  layerImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginBottom: 5,
  },
  layerText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
