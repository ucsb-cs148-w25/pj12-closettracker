import { 
  requestCameraPermissionsAsync, 
  launchCameraAsync, 
  requestMediaLibraryPermissionsAsync, 
  launchImageLibraryAsync
 } from 'expo-image-picker';

export const useCameraImage = (): Function => {

  const captureImage = async (): Promise<String | null | undefined> => {
    try {
      // Request permission to access the camera
      const permissionResult = await requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        console.log('Permission Denied', 'You need to grant permission to access your camera.');
        return null;
      }

      // Open camera
      const result = await launchCameraAsync({
        allowsEditing: true,
        mediaTypes: "images",
        base64: true,
        quality: 1,   // Maximum quality
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        return image.base64;
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
    return null;
  };

  
  return captureImage;

};

export const useSelectImage = (): Function => {

  const selectImage = async (): Promise<String | null | undefined> => {
    try {
      // Request permission to access media library
      const permissionResult = await requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        console.log('Permission Denied', 'You need to grant permission to access your photos.');
        return null;
      }

      // Open image picker
      const result = await launchImageLibraryAsync({
        allowsEditing: true,
        // allowsMultipleSelection: false,
        mediaTypes: "images",
        base64: true,
        quality: 1,   // Maximum quality
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        return image.base64;
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
    return null;
  };

  
  return selectImage

};