import { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, StyleSheet, Text, Image, TextInput, TouchableOpacity } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, getFirestore, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import ViewShot, { captureRef } from "react-native-view-shot";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useUser } from "@/context/UserContext";

export default function CanvasScreen() {
  const param = useLocalSearchParams();
  const { outfitId } = param;
  const itemIds = outfitId ? [] : JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const [itemUri, setItemUri] = useState<{ id: string; uri: string; itemName: string }[]>([]);
  const [outfitName, setOutfitName] = useState(""); 
  const [transforms, setTransforms] = useState<{ [id: string]: { translationX: number; translationY: number; scale: number } }>({});
  const [loading, setLoading] = useState(false);

  const { currentUser } = useUser();

  const router = useRouter();
  const viewRef = useRef<ViewShot>(null);

  const takeScreenshot = async () => {
    try {
      setLoading(true);
      const uri = await captureRef(viewRef, { format: 'png', quality: 0.8, result: 'base64' });
      await handleSubmit(uri);
    } catch (error) {
      setLoading(false);
      console.error('Failed to capture screenshot:', error);
    }
  };

  const handleTransformChange = (id: string, transform: { translationX: number; translationY: number; scale: number }) => {
    setTransforms(prev => ({ ...prev, [id]: transform }));
  };

  const handleSubmit = async (outfitImageUri: string) => {
    if (!outfitImageUri) {
      alert("Error: no screenshot taken.");
      return;
    } else if (!itemUri.length) {
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
      const filePath = `user_${currentUser?.uid}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('outfitImages')
        .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('outfitImages').getPublicUrl(filePath);
      const imageUrl = urlData.publicUrl;
      console.log("Public URL:", imageUrl);

      const db = getFirestore();
      if (!currentUser) {
        alert("Please sign in before uploading your outfits.");
        return;
      }

      const clothingItems = itemUri.map(item => ({
        itemRef: doc(db, "users", currentUser.uid, "clothing", item.id),
        translationX: transforms[item.id]?.translationX ?? 0,
        translationY: transforms[item.id]?.translationY ?? 0,
        scale: transforms[item.id]?.scale ?? 0.5,
      }));

      // If editing an existing outfit, update its document; otherwise create new
      if (outfitId) {
        await updateDoc(doc(db, "users", currentUser.uid, "outfit", String(outfitId)), {
          itemName: outfitName.trim(),
          image: imageUrl,
          clothingItems,
        });
        alert("Outfit updated successfully!");
        router.push(`../(screens)/editItem?item_id=${outfitId}&collections=outfit`);
      } else {
        const docRef = await addDoc(collection(db, "users", currentUser.uid, "outfit"), {
          itemName: outfitName.trim(),
          image: imageUrl,
          clothingItems,
        });
        alert("Outfit uploaded successfully!");
        router.push(`../(screens)/editItem?item_id=${docRef.id}&collections=outfit`);
      }
    } catch (error) {
      console.error("Error uploading outfit: ", error);
      alert("Failed to upload outfit.");
    } finally {
      setLoading(false); // NEW: reset loading state
    }
  };

  useEffect(() => {
    if (outfitId) {
      console.log("Outfit");
      // Editing an existing outfit: fetch outfit document and clothing items from Firestore
      (async () => {
        if (!currentUser) return;
        try {
          const outfitDocRef = doc(getFirestore(), "users", currentUser.uid, "outfit", String(outfitId));
          const outfitDoc = await getDoc(outfitDocRef);
          if (!outfitDoc.exists()) {
            console.error("Outfit not found");
            return;
          }
          const outfitData = outfitDoc.data();
          setOutfitName(outfitData.itemName || "");
          const clothingItems = outfitData.clothingItems || [];
          // For each clothing item, fetch the clothing document for its image and name
          const fetchedItems = await Promise.all(clothingItems.map(async (item: any) => {
            const clothingDoc = await getDoc(item.itemRef);
            if (!clothingDoc.exists()) {
              console.error("Clothing item not found");
              return null;
            }
            const data = clothingDoc.data() as { image: string; itemName: string };
            if (!data) return null;
            // Set transform state for this item
            setTransforms(prev => ({
              ...prev,
              [clothingDoc.id]: {
                translationX: item.translationX ?? 0,
                translationY: item.translationY ?? 0,
                scale: item.scale ?? 0.5
              }
            }));
            return {
              id: clothingDoc.id,
              uri: data.image,
              itemName: data.itemName,
            };
          }));
          setItemUri(fetchedItems.filter((item: any) => item !== null));
        } catch (error) {
          console.error("Error fetching outfit data:", error);
        }
      })();
    }
  }, [outfitId, currentUser]);
  
  useEffect(() => {
    const fetchItems = async () => {
      if (!currentUser) return;
      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) return;
      
      try {
        const ClothingRef = collection(db, "users", currentUser.uid, "clothing");
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

    if (!outfitId) {
      console.log("Fetching items");
      fetchItems();
    }
  }, [outfitId, currentUser?.uid, JSON.stringify(itemIds)]);

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
          defaultValue={outfitName}
          onChangeText={setOutfitName}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={takeScreenshot}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? "Loading..." : "Submit"}</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas with clothing items */}
      <ViewShot style={styles.canvas} ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
        <View>
          {itemUri.map(({ id, uri }) => (
            <DraggableResizableImage 
              key={id} 
              uri={uri}
              onTransformChange={(transform) => handleTransformChange(id, transform)}
              initialTransform={transforms[id]}
            />
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
