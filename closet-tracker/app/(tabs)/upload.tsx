import { useState } from "react";
import { Image, StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function UploadScreen() {
  const selectImage = useSelectImage();
  const captureImage = useCameraImage();
  const [image, setImage] = useState<string | null | undefined>(null);

  return (
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
          <Image source={{ uri: `data:image/png;base64,${image}` }} style={styles.image} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => setImage(null)}>
              <Text style={[styles.optionButtonText, { color: '#fff' }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={async () => setImage(await selectImage())}
            >
              <Text style={[styles.optionButtonText, { color: '#fff' }]}>Replace from Camera Roll</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={async () => setImage(await captureImage())}
            >
              <Text style={[styles.optionButtonText, { color: '#fff' }]}>Replace from Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Show upload options if no image is selected
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
      <TouchableOpacity style={styles.submitButton}>
        <Text style={[styles.submitButtonText, { color: '#fff' }]}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 85,
    paddingBottom: 30, // Add padding at the bottom to ensure the Submit button is reachable
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
    marginBottom: 70,
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
});