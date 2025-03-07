import { useState } from "react";
import { Image, StyleSheet, ScrollView, View, Text, TouchableOpacity, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useRouter } from 'expo-router';
import { removeBackground } from "@/removebg";
import { useUser } from "@/context/UserContext";
import beigeColors from '@/aesthetic/beigeColors';
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function UploadScreen() {
  const selectImage = useSelectImage();
  const captureImage = useCameraImage();
  const [image, setImage] = useState<string | null | undefined>(null);
  const [rmbgImage, setRmbgImage] = useState<string | null | undefined>(null);
  const [itemName, setItemName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { currentUser } = useUser();
  
  const handleSubmit = async () => {
    if (!rmbgImage || !itemName) {
      alert("Please select an image, remove background, and enter an item name.");
      return;
    }
  
    setLoading(true);
  
    try {  
      // extract base64 data from image URI
      const base64 = rmbgImage;
      const arrayBuffer = decode(base64); // converting base64 to ArrayBuffer

      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `user_${currentUser?.uid}/${fileName}`;
  
      // uploading to supabase
      const { error: uploadError } = await supabase.storage
        .from('closetImages')
        .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
      });  
      if (uploadError) {
        throw uploadError;
      }
  
      // retrieve pub url of uploaded image
      const { data: urlData } = supabase.storage
        .from('closetImages')
        .getPublicUrl(filePath);
  
      const imageUrl = urlData.publicUrl;
  
      // store in firestore
      const db = getFirestore();
  
      if (!currentUser) {
        alert("Please sign in before uploading your clothes.");
        return;
      }
  
      const docRef = await addDoc(collection(db, "users", currentUser.uid, "clothing"), {
        itemName: itemName,
        image: imageUrl,
        dateUploaded: new Date(),
        wearCount: 0,
      });
  
      alert("Item uploaded successfully!");
      setImage(null);
      setRmbgImage(null);
      setItemName("");
      
      router.push(`../(screens)/editItem?item_id=${docRef.id}&collections=clothing`);

    } catch (error) {
      console.error("Error uploading item: ", error);
      alert("Failed to upload item.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const result = await removeBackground(image);
      setRmbgImage(result);
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setImage(null);
    setRmbgImage(null);
    setItemName("");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title Section */}
        <Text style={styles.title}>Add to Your Closet</Text>

        {/* Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.contentBox}>
            <Text style={styles.descriptionText}>
              Use your camera to upload an item, or select a photo from your gallery.
            </Text>
            <Text style={styles.descriptionText}>
              For best results, place your item on a plain background.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={beigeColors.mutedGold} />
            <Text style={styles.loadingText}>
              {rmbgImage ? "Uploading..." : "Processing image..."}
            </Text>
          </View>
        ) : image ? (
          // Display selected image and options
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Your Item</Text>
            <View style={styles.contentBox}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${rmbgImage ? rmbgImage : image}` }} 
                  style={styles.image} 
                  resizeMode="contain"
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                placeholderTextColor={beigeColors.taupe}
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            <View style={styles.buttonRow}>
              {rmbgImage ? (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleRemoveBackground}>
                  <Text style={styles.buttonText}>Remove Background</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleClear}>
                <Text style={styles.buttonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Image Selection Options */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Upload Method</Text>
              <View style={styles.contentBox}>
                <TouchableOpacity 
                  style={[styles.uploadOption, styles.modeButton]} 
                  onPress={async () => setImage(await selectImage())}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="folder" size={30} color={beigeColors.darkBeige} />
                    <Text style={styles.buttonText}>Gallery</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.optionDivider}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.line} />
                </View>
                
                <TouchableOpacity 
                  style={[styles.uploadOption, styles.modeButton]} 
                  onPress={async () => setImage(await captureImage())}
                >
                  <View style={styles.buttonContent}>
                    <IconSymbol name="camera" size={30} color={beigeColors.darkBeige} />
                    <Text style={styles.buttonText}>Camera</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: beigeColors.beige,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: beigeColors.darkBeige,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: beigeColors.darkBeige,
  },
  contentBox: {
    backgroundColor: beigeColors.softBrown,
    borderRadius: 8,
    padding: 15,
  },
  descriptionText: {
    color: beigeColors.brown,
    fontSize: 15,
    marginBottom: 8,
  },
  imageSection: {
    width: '100%',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadOption: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButton: {
    backgroundColor: beigeColors.taupe,
    borderRadius: 8,
    marginVertical: 10,
  },
  optionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: beigeColors.taupe,
  },
  orText: {
    fontSize: 14,
    marginHorizontal: 10,
    color: beigeColors.brown,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: beigeColors.taupe,
    borderRadius: 8,
    backgroundColor: 'white',
    color: beigeColors.darkBeige,
  },
  buttonRow: {
    marginTop: 20,
  },
  button: {
    backgroundColor: beigeColors.taupe,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: beigeColors.softBrown,
    borderWidth: 1,
    borderColor: beigeColors.taupe,
  },
  buttonText: {
    color: beigeColors.darkBeige,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: beigeColors.darkBeige,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});