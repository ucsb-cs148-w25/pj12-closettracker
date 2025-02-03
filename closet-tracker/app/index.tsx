import React, { useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/FirebaseConfig';

export default function Index() {
  const router = useRouter();

  useEffect (() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('./(tabs)/wardrobe');
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Closet Tracker</Text>
      <Text style={styles.subtitle}>The app's tagline or description goes here.</Text>

      {/* Navigation Buttons */}
      <Button title="Login" onPress={() => router.push('./(login)/login')} />
      <Button title="Sign Up" onPress={() => router.push('./(login)/signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
