import { Text, StyleSheet, Platform, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig';

export default function Index() {
  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out the user
      console.log("User signed out successfully");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>
      <Text style={styles.subtitle}>Your app's tagline or description goes here.</Text>
      <Button title='Log Out' onPress={handleSignOut} /> {/* Call handleSignOut on button press */}
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
