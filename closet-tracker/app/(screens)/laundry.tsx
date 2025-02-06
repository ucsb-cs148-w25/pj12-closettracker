import { StyleSheet, Text, Button } from 'react-native';
import React from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LaundryScreen() {
    const router = useRouter();

    return (
      <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Laundry Bin</Text>
            <Button title="Back to Wardrobe" onPress={() => router.replace(`../(tabs)/wardrobe`)} />
          </SafeAreaView>
      </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingHorizontal: 15,
    },
});