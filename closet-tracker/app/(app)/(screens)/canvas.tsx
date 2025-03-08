import { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, StyleSheet, Text, Image, TextInput, TouchableOpacity, Switch } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, query, where, getDocs, getDoc, getFirestore, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import ViewShot, { captureRef } from "react-native-view-shot";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useUser } from "@/context/UserContext";
import { removeBackground } from "@/removebg";

export default function CanvasScreen() {
  const param = useLocalSearchParams();
  const { outfitId } = param;
  const itemIds = outfitId ? [] : JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const [itemUri, setItemUri] = useState<{ id: string; uri: string; itemName: string; isProfilePics: boolean }[]>([]);
  const [outfitName, setOutfitName] = useState(""); 
  const [transforms, setTransforms] = useState<{ [id: string]: { translationX: number; translationY: number; scale: number } }>({});
  const [loading, setLoading] = useState(false);
  
  // Profile picture specific states
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [profilePicTransform, setProfilePicTransform] = useState<{ translationX: number; translationY: number; scale: number } | null>(null);
  
  // Combined items for display
  const [combinedItems, setCombinedItems] = useState<{ id: string; uri: string; itemName: string; isProfilePics: boolean }[]>([]);
  
  const { currentUser } = useUser();
  const router = useRouter();
  const viewRef = useRef<ViewShot>(null);

  useEffect(() => {
    // Start with clothing items
    const newCombinedItems = [...itemUri];
    
    // Add profile picture if it should be shown
    if (showProfilePicture && profilePictureUri) {
      // Insert profile picture at the beginning of the array
      newCombinedItems.unshift({ 
        id: "profile", 
        uri: profilePictureUri, 
        itemName: "Profile Picture",
        isProfilePics: true
      });
    }
    
    setCombinedItems(newCombinedItems);
  }, [showProfilePicture, profilePictureUri, itemUri]);

  // Handle drag end for the layer order
  const handleDragEnd = ({ data }: { data: { id: string; uri: string; itemName: string; isProfilePics: boolean }[] }) => {
    setCombinedItems(data);
    
    // Filter out profile picture from clothing items
    const newItemUri = data.filter(item => !item.isProfilePics);
    setItemUri(newItemUri);
  };

  // Capture screenshot for saving the outfit
  const takeScreenshot = async () => {
    try {
      setLoading(true);
      const uri = await captureRef(viewRef, { format: 'jpg', quality: 1, result: 'base64' });
      await handleSubmit(uri);
    } catch (error) {
      setLoading(false);
      console.error('Failed to capture screenshot:', error);
    }
  };

  // Handle transform updates for any draggable image
  const handleTransformChange = (id: string, transform: { translationX: number; translationY: number; scale: number }) => {
    if (id === "profile") {
      setProfilePicTransform(transform);
    } else {
      setTransforms(prev => ({ ...prev, [id]: transform }));
    }
  };

  // Save outfit to the database
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
      const result = await removeBackground(outfitImageUri);
      const base64 = result;
      const arrayBuffer = decode(base64);
      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `user_${currentUser?.uid}/${fileName}`;

      // Upload outfit image to Supabase
      const { error: uploadError } = await supabase.storage
        .from('outfitImages')
        .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('outfitImages').getPublicUrl(filePath);
      const imageUrl = urlData.publicUrl;

      const db = getFirestore();
      if (!currentUser) {
        alert("Please sign in before uploading your outfits.");
        return;
      }
      
      // Create clothing items array with their transforms
      const clothingItems = itemUri.map(item => ({
        itemRef: doc(db, "users", currentUser.uid, "clothing", item.id),
        translationX: transforms[item.id]?.translationX ?? 0,
        translationY: transforms[item.id]?.translationY ?? 0,
        scale: transforms[item.id]?.scale ?? 0.5,
      }));

      // Prepare outfit data with separate profilePic field
      const outfitData = {
        itemName: outfitName.trim(),
        image: imageUrl,
        dateUploaded: new Date(),
        clothingItems,
        // Only include profilePic if it's shown
        ...(showProfilePicture && profilePicTransform ? {
          profilePic: {
            translationX: profilePicTransform.translationX,
            translationY: profilePicTransform.translationY,
            scale: profilePicTransform.scale,
          }
        } : { profilePic: null }),
      };

      // Update existing outfit or create a new one
      if (outfitId) {
        await updateDoc(doc(db, "users", currentUser.uid, "outfit", String(outfitId)), outfitData);
        alert("Outfit updated successfully!");
        router.replace(`../(screens)/editItem?item_id=${outfitId}&collections=outfit`);
      } else {
        const docRef = await addDoc(collection(db, "users", currentUser.uid, "outfit"), outfitData);
        alert("Outfit uploaded successfully!");
        router.replace(`../(screens)/editItem?item_id=${docRef.id}&collections=outfit`);
      }
    } catch (error) {
      console.error("Error uploading outfit: ", error);
      alert("Failed to upload outfit.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing outfit data when editing
  useEffect(() => {
    if (outfitId) {
      (async () => {
        if (!currentUser) return;
        try {
          // Get outfit document
          const outfitDocRef = doc(getFirestore(), "users", currentUser.uid, "outfit", String(outfitId));
          const outfitDoc = await getDoc(outfitDocRef);
          if (!outfitDoc.exists()) {
            console.error("Outfit not found");
            return;
          }
          
          const outfitData = outfitDoc.data();
          setOutfitName(outfitData.itemName || "");
          
          // Handle profile picture if exists in outfit data
          if (outfitData.profilePic) {
            setShowProfilePicture(true);
            setProfilePicTransform({
              translationX: outfitData.profilePic.translationX,
              translationY: outfitData.profilePic.translationY,
              scale: outfitData.profilePic.scale
            });
          } else {
            setShowProfilePicture(false);
          }
          
          // Handle clothing items
          const clothingItems = outfitData.clothingItems || [];
          const fetchedItems = await Promise.all(clothingItems.map(async (item: any) => {
            const clothingDoc = await getDoc(item.itemRef);
            if (!clothingDoc.exists()) return null;
            
            const data = clothingDoc.data() as { image: string; itemName: string };
            if (!data) return null;
            
            // Set transform for this clothing item
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
  
  // Fetch initial items and profile picture
  useEffect(() => {
    const fetchItems = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch user profile picture
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfilePictureUri(userData?.profilePicture || null);
        }
        
        // If not editing and we have item IDs, fetch those items
        if (!outfitId && itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
          const ClothingRef = collection(db, "users", currentUser.uid, "clothing");
          const q = query(ClothingRef, where("__name__", "in", itemIds));
          const querySnapshot = await getDocs(q);
          const fetchedImages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            uri: doc.data().image,
            itemName: doc.data().itemName,
            isProfilePics: false,
          }));
          
          setItemUri(fetchedImages);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
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

      {profilePictureUri && (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Show Profile Picture</Text>
          <Switch
            value={showProfilePicture}
            onValueChange={(value) => setShowProfilePicture(value)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={showProfilePicture ? "#007BFF" : "#f4f3f4"}
          />
        </View>
      )}

      {/* Canvas with items */}
      <ViewShot style={styles.canvas} ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
        <View>
          {combinedItems.map(({ id, uri, isProfilePics }) => (
            <DraggableResizableImage 
              key={id} 
              uri={uri}
              onTransformChange={(transform) => handleTransformChange(id, transform)}
              initialTransform={isProfilePics ? profilePicTransform || undefined : transforms[id]}
            />
          ))}
        </View>
      </ViewShot>

      {/* Draggable Layer List (Horizontal) */}
      <View style={styles.layerContainer}>
        <Text style={styles.layerTitle}>Adjust Layer Order</Text>
        <DraggableFlatList
          horizontal
          data={combinedItems}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  toggleText: {
    marginRight: 10,
    fontSize: 16,
    color: "#333",
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