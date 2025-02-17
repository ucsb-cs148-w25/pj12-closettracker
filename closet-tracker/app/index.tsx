import React, { useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/FirebaseConfig';
import beigeColors from '@/aesthetic/beigeColors';

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
      <TouchableOpacity 
        onPress={() => router.push('./(login)/login')} 
        style={[styles.button, {backgroundColor: beigeColors.cream}]}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('./(login)/signup')}
        style={[styles.button, {backgroundColor: beigeColors.taupe}]}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: beigeColors.lightBeige,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: beigeColors.darkBeige,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: beigeColors.brown,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: beigeColors.darkBeige,
    fontSize: 16,
  },
});
