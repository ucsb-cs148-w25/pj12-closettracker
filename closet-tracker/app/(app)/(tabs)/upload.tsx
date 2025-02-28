import { useState } from "react";
import { Image, StyleSheet, ScrollView, View, Text, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useRouter } from 'expo-router';
import { removeBackground } from "@/removebg";
import { useUser } from "@/context/UserContext";


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
      // console.log("Base64 data:", base64);

      const fileName = `image_${Date.now()}.jpg`;
      const filePath = `user_${currentUser?.uid}/${fileName}`;
  
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
      const db = getFirestore();
  
      if (!currentUser) {
        alert("Please sign in before uploading your clothes.");
        return;
      }
  
      const docRef = await addDoc(collection(db, "users", currentUser.uid, "clothing"), {
        itemName: itemName,
        image: imageUrl,
      });
  
      alert("Item uploaded successfully!");
      setImage(null);
      setItemName("");
      
      console.log(docRef.id)
      router.push(`../(screens)/editItem?item_id=${docRef.id}&collections=clothing`);

    } catch (error) {
      console.error("Error uploading item: ", error);
      alert("Failed to upload item.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    try {
      const result = await removeBackground(image!);
      setRmbgImage(result);
    } catch (error) {
      console.error("Error removing background:", error);
    }
  }

  const handleClear = () => {
    setImage(null);
    setRmbgImage(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Title Section */}
        <ThemedView style={[styles.titleContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText type="title" style={{ backgroundColor: 'transparent', color: '#000' }}>
            Upload your clothes!
          </ThemedText>
        </ThemedView>

        {/* Subtitle Section */}
        <ThemedView style={[styles.subtitleContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText type="subtitle" style={{ backgroundColor: 'transparent', color: '#000' }}>
            Use your camera to upload an item, or select a photo from your camera roll. Please ensure the photo is taken on a solid background.
          </ThemedText>
        </ThemedView>

        {image ? (
          // Display selected image and options
          <View style={styles.imageContainer}>
            <Image source={{ uri: `data:image/jpeg;base64,${rmbgImage ? rmbgImage: image}` }} style={styles.image} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleClear()}>
                <Text style={[styles.optionButtonText, { color: '#fff' }]}>Clear</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                value={itemName}
                onChangeText={setItemName}
              />

            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.uploadBox} onPress={async () => setImage(await selectImage())}>
              <Text style={[styles.uploadBoxText, { color: '#fff' }]}>Select from Camera Roll</Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={[styles.orText, { color: '#000' }]}>or</Text>
              <View style={styles.line} />
            </View>

            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton} onPress={async () => setImage(await captureImage())}>
              <Text style={[styles.cameraButtonText, { color: '#fff' }]}>Open Camera & Take Photo</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Dividing Line */}
        <View style={styles.lineDivider} />

        {/* Submit Button */}
        {image && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={rmbgImage ? handleSubmit : handleRemoveBackground}
            disabled={loading}
          >
            <Text style={[styles.submitButtonText, { color: '#fff' }]}>
              {loading
                ? "Uploading..."
                : rmbgImage
                ? "Submit"
                : "Remove Background"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 100,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  uploadBoxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  orText: {
    fontSize: 14,
  },
  cameraButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 30,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  buttonContainer: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lineDivider: {
    height: 1,
    backgroundColor: '#444',
    marginBottom: 30,
    width: '100%',
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },

});