import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Button, ActivityIndicator, View, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { auth } from '@/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const selectImage = useSelectImage();
  const captureImage = useCameraImage();
  const [image, setImage] = useState<string | null | undefined>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null | undefined>(null);

  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser); // Set user state
      setLoading(false);  // Stop loading after checking authentication
    });

    return () => unsubscribe(); // Unsubscribe on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Select Image" onPress={async () => setImage(await selectImage())} />
      <Button title="Capture Image" onPress={async () => setImage(await captureImage())} />
      {image && (
    <SafeAreaView style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.email}</Text>
          <Button title="Log Out" onPress={handleSignOut} />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>You are not logged in.</Text>
          <Button title="Login" onPress={() => router.push('./(login)/login')} />
          <Button title="Sign Up" onPress={() => router.push('./(login)/signup')} />
        </>
      )}
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
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
