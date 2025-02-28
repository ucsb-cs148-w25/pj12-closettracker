import { Button, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';

export default function Auth() {
  const router = useRouter();
  const { currentUser } = useUser();
  
  if (currentUser) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Closet Tracker</Text>
      <Text style={styles.subtitle}>The app's tagline or description goes here.</Text>

      {/* Navigation Buttons */}
      <Button title="Login" onPress={() => router.push('./login')} />
      <Button title="Sign Up" onPress={() => router.push('./signup')} />
    </SafeAreaView>
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
