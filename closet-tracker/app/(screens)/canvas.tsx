import { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, StyleSheet, Text, Image, Button } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs, getFirestore, addDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import ViewShot, { captureRef } from "react-native-view-shot";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useRouter } from 'expo-router';

export default function CanvasScreen() {
  const param = useLocalSearchParams();
  const itemIds = JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const [itemUri, setItemUri] = useState<{ id: string; uri: string; name: string }[]>([]);

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

  const handleSubmit = async (outfitImageUri : string) => {
    if (!outfitImageUri) {
      alert("Error: no screenshots taken.");
      return;
    }
    else if(!itemUri || itemUri.length === 0) {
      alert("Error: no items to upload.");
      return;
    }
  
    try {  
      // extract base64 data from image URI
      const base64 = outfitImageUri;
      const arrayBuffer = decode(base64); // converting base64 to ArrayBuffer
      // console.log("Base64 data:", base64);

      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `user_${getAuth().currentUser?.uid}/${fileName}`;
  
      // uploading to supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('closetImages')
        .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
      });  
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }
  
      // retrieve pub url of uploaded image
      const { data: urlData } = supabase.storage
        .from('closetImages')
        .getPublicUrl(filePath);
  
      const imageUrl = urlData.publicUrl;
      console.log("Public URL:", imageUrl);
  
      // store in firestore
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;
  
      if (!user) {
        alert("Please sign in before uploading your outfits.");
        return;
      }
  
      const docRef = await addDoc(collection(db, "users", user.uid, "outfit"), {
        image: imageUrl,
        clothingIds: itemUri.map((item) => item.id),
      });
  
      alert("Item uploaded successfully!");
      
      console.log(docRef.id)
      router.push(`../(screens)/uploadOutfitData?item_id=${docRef.id}`);

    } catch (error) {
      console.error("Error uploading item: ", error);
      alert("Failed to upload item.");
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
      <ViewShot style={styles.canvas} ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
        <View>
          {itemUri.map(({ id, uri }) => (
            <DraggableResizableImage key={id} uri={uri}/>
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
        <Button title="Take Screenshot" onPress={takeScreenshot} />
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
    height: 150, // Reduced height for better UX
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
