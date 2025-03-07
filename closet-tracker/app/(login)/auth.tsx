import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useUser } from '@/context/UserContext';
import beigeColors from '@/aesthetic/beigeColors';

export default function Auth() {
  const router = useRouter();
  const { currentUser } = useUser();
  
  if (currentUser) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Closet Tracker</Text>
      <Text style={styles.subtitle}>Organize and Style your Wardrobe Effortlessly!</Text>

      <TouchableOpacity 
        onPress={() => router.push('./login')} 
        style={styles.button}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('./signup')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: beigeColors.beige,
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
    backgroundColor: beigeColors.taupe,
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