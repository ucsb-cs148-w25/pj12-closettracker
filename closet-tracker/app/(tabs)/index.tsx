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
    <SafeAreaView>
      <Text>Test</Text>
      <Button title='Log Out' onPress={handleSignOut} /> {/* Call handleSignOut on button press */}
    </SafeAreaView>
  );
}
