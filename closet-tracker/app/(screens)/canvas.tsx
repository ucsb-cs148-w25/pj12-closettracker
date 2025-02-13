import { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, StyleSheet, Text, Image, TextInput, TouchableOpacity } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs, getFirestore, addDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import ViewShot, { captureRef } from "react-native-view-shot";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';

export default function CanvasScreen() {
  const param = useLocalSearchParams();
  const itemIds = JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const [itemUri, setItemUri] = useState<{ id: string; uri: string; itemName: string }[]>([]);
  const [outfitName, setOutfitName] = useState(""); // Outfit name input state

  const router = useRouter();
  const viewRef = useRef<ViewShot>(null);

  const takeScreenshot = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.8,
        result: 'base64',
      });
      await handleSubmit(uri);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  const handleSubmit = async (outfitImageUri: string) => {
    if (!outfitImageUri) {
      alert("Error: no screenshot taken.");
      return;
    } else if (!itemUri || itemUri.length === 0) {
      alert("Error: no items to upload.");
      return;
    } else if (!outfitName.trim()) {
      alert("Please enter an outfit name.");
      return;
    }

    try {
      const base64 = outfitImageUri;
      const arrayBuffer = decode(base64); 

      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `user_${getAuth().currentUser?.uid}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('outfitImages')
        .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from('outfitImages').getPublicUrl(filePath);
      const imageUrl = urlData.publicUrl;
      console.log("Public URL:", imageUrl);

      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (!user) {
        alert("Please sign in before uploading your outfits.");
        return;
      }

      const docRef = await addDoc(collection(db, "users", user.uid, "outfit"), {
        itemName: outfitName.trim(),
        image: imageUrl,
        clothingIds: itemUri.map((item) => item.id),
      });

      alert("Outfit uploaded successfully!");
      router.push(`../(screens)/editItem?item_id=${docRef.id}&collections=outfit`);
    } catch (error) {
      console.error("Error uploading outfit: ", error);
      alert("Failed to upload outfit.");
    }
  };

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
          itemName: doc.data().itemName,
        }));

        setItemUri(fetchedImages);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const renderItem = (params: RenderItemParams<{ id: string; uri: string; itemName: string }>) => (
    <ScaleDecorator>
      <View style={styles.layerItem} onTouchStart={params.drag}>
        <Image source={{ uri: params.item.uri }} style={styles.layerImage} />
        <Text style={styles.layerText}>{params.item.itemName}</Text>
      </View>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TextInput
          style={styles.input}
          placeholder="Enter outfit name..."
          value={outfitName}
          onChangeText={setOutfitName}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.submitButton} onPress={takeScreenshot}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas with clothing items */}
      <ViewShot style={styles.canvas} ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
        <View>
          {itemUri.map(({ id, uri }) => (
            <DraggableResizableImage key={id} uri={uri} />
          ))}
        </View>
      </ViewShot>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  canvas: {
    flex: 1,
    position: "relative",
  },
  layerContainer: {
    height: 150,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  layerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
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
