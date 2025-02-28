import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect, Link } from 'expo-router';
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

      {/* Navigation Links */}
      <Link href="/login" style={styles.link}>
        <Text>Login</Text>
      </Link>
      <Link href="/signup" style={styles.link}>
        <Text>Sign Up</Text>
      </Link>
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
  link: {
    fontSize: 18,
    color: '#1E90FF',
    marginVertical: 10,
  },
});
