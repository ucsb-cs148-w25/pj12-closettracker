import React, { useState, useEffect } from 'react';
import { FlatList, Text, StyleSheet, TextInput, Button, View, KeyboardAvoidingView, Platform } from 'react-native';
import { DocumentSnapshot } from "firebase/firestore"; 

export default function OutfitDataDropdowns ({
    handleOutfitSubmit,
    docSnapshot,
  }: {
    handleOutfitSubmit: (
        itemName: string | null,
        note: string
    ) => Promise<void>,
    docSnapshot: DocumentSnapshot | null;
  }) {
  const [placeholders, setPlaceholders] = useState({
    itemName: "",
    note: "",
    wearCount: 0,
  });

  useEffect(() => {
    //assign placeholder values ?
    if (docSnapshot && docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Assign values with placeholders
      const placeholder_name = data.itemName || "";
      const placeholder_note = data.note || "";
      const placeholder_wearCount = data.wearCount ?? 0; // Default to 0 if missing

      setPlaceholders({
        itemName: placeholder_name,
        note: placeholder_note,
        wearCount: placeholder_wearCount,
      });
      
    }
  }, [docSnapshot]); // Re-run effect when docSnapshot changes
  const [note, setNote] = useState(placeholders.note);
  const [newName, setNewName] = useState(placeholders.itemName);
  
  useEffect(() => {
    setNote(placeholders.note);
    setNewName(placeholders.itemName);
  }, [placeholders]);  // FlatList data
  const data = [
    {
      key: 'itemName',
      label: 'Name:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder={placeholders.itemName || "Set name"}
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
          placeholder={placeholders.note || "Add note"}
          value={note}
          onChangeText={setNote}
          multiline={true}
        />
      ),
    },
    {
      key: 'submit',
      dropdown: (
        <Button title="Submit" onPress={() => handleOutfitSubmit(newName, note)} />
      ),
    },
  ];


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{width: '100%', flex: 1}}>
      <FlatList
        nestedScrollEnabled={true}
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
    </KeyboardAvoidingView>
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
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingLeft: 8,
      borderRadius: 4,
    },
    
  });