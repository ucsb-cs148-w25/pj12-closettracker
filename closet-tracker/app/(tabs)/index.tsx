import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser); // Set user state
      setLoading(false);  // Stop loading after checking authentication
      if (authUser) {
        // Fetch the user's name from Firestore
        const userRef = doc(db, 'users', authUser.uid);  // User document reference
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(userData?.name || ''); // Set name state if available
        }
      }
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
    <SafeAreaView style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Welcome, {userName || user.email}!</Text>
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
