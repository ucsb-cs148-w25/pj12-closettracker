import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';

export default function App() {
  // State to manage the text
  const [text, setText] = useState('Welcome to My App!');

  // Function to handle button press and update text
  const handlePress = () => {
    if (text === 'Hello World :)') {
      setText('Welcome to my app!');
    } else {
      setText('Hello World :)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{text}</Text>
      <Button title="Click Me" onPress={handlePress} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333', // Text color
  },
});
