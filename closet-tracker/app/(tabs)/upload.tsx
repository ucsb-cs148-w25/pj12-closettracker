import { Image, StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function UploadScreen() {
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
        <Text style={styles.uploadBoxText}>Select from Camera Roll</Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton}>
        <Text style={styles.cameraButtonText}>Open Camera & Take Photo</Text>
      </TouchableOpacity>

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
    backgroundColor: '#151718',
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
