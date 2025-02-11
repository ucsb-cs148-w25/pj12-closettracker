import React, { useState } from 'react';
import { FlatList, Text, StyleSheet, TextInput, Button, View } from 'react-native';


export default function outfitDataDropdowns ({
    handleSubmit,
    name
  }: {
    handleSubmit: (
        name: string | null,
        note: string
    ) => Promise<void>,
    name: string | null
  }) {
  const [note, setNote] = useState('');
  const [newName, setNewName] = useState(name || '');
  // FlatList data
const data = [
    {
      key: 'name',
      label: 'Name:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder={name || 'Enter outfit name'}
          value={newName}
          onChangeText={setNewName}
        />
      ),
    },
    {
      key: 'note',
      label: 'Notes:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder="Enter notes"
          value={note}
          onChangeText={setNote}
          multiline={true}
        />
      ),
    },
    {
      key: 'submit',
      dropdown: (
        <Button title="Submit" onPress={() => handleSubmit(newName, note)} />
      ),
    },
  ];


    return (
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.dropdownContainer}>
            {item.label && <Text style={styles.label}>{item.label}</Text>}
            {item.dropdown}
          </View>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.container}
        style={{ width: '100%' }}
      />
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    dropdownContainer: {
      marginBottom: 10,
      width: '100%',
    },
    dropdown: {
      height: 50,
      width: '100%',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
    },
    dropdownList: {
      marginTop: 5,
      width: '100%',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingLeft: 8,
      borderRadius: 4,
    },
    
  });