import { useState } from "react";
import { Button, Image, StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function UploadScreen() {
  const selectImage = useSelectImage();
  const captureImage = useCameraImage();
  const [image, setImage] = useState<string | null | undefined>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null | undefined>(null);
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title Section */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Upload your clothes!</ThemedText>
      </ThemedView>

      {/* Subtitle Section */}
      <ThemedView style={styles.subtitleContainer}>
        <ThemedText type="subtitle">
          Use your camera to upload an item, or select a photo from your camera roll. Please ensure the photo is taken on a solid background.
        </ThemedText>
      </ThemedView>

      {/* Upload Box */}
      <TouchableOpacity style={styles.uploadBox}>
      <Button title="Select from Camera Roll" onPress={async () => setImage(await selectImage())} />
      </TouchableOpacity>
      {image && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${image}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setImage(null)} />
          {/* <Button title="Remove Background" onPress={() => setImage(null)} /> */}
        </SafeAreaView>
      )}
      {modifiedImage && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${modifiedImage}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setModifiedImage(null)} />
        </SafeAreaView>
      )}

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton}>
      <Button title="Open Camera & Take Photo" onPress={async () => setImage(await captureImage())} />
      </TouchableOpacity>
      {image && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${image}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setImage(null)} />
          {/* <Button title="Remove Background" onPress={() => setImage(null)} /> */}
        </SafeAreaView>
      )}
      {modifiedImage && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${modifiedImage}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setModifiedImage(null)} />
        </SafeAreaView>
      )}

      {/* Dividing Line */}
      <View style={styles.lineDivider}>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 85,
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
    color: '#FFF',
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
    color: '#AAA',
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
    color: '#FFF',
    fontSize: 16,
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lineDivider: {
    height: 1,
    backgroundColor: '#444',
    marginBottom: 30,
    width: '100%',
  }
});
