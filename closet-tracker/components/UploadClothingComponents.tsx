import React, { useState, useEffect } from 'react';
import { FlatList, Text, StyleSheet, TextInput, Button, View, KeyboardAvoidingView, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { DocumentSnapshot } from "firebase/firestore"; 

export default function ClothingDataDropdowns ({
    handleClothingSubmit,
    docSnapshot,
  }: {
    handleClothingSubmit: (
        itemName: string | null,
        size: string | null,
        color: string | null, 
        clothingType: string | null, 
        brand: string, 
        note: string,
        wearCount: number | null
    ) => Promise<void>; //for asynch?
    docSnapshot: DocumentSnapshot | null;

  }) {

  const [placeholders, setPlaceholders] = useState({
    itemName: "",
    size: null,
    color: null,
    clothingType: null,
    brand: "",
    note: "",
    wearCount: 0,
  });

  useEffect(() => {
    //assign placeholder values ?
    if (docSnapshot && docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Assign values with placeholders
      const placeholder_name = data.itemName || "";
      const placeholder_size = data.size || null;
      const placeholder_color = data.color || null;
      const placeholder_clothingType = data.clothingType || null;
      const placeholder_brand = data.brand || "";
      const placeholder_note = data.note || "";
      const placeholder_wearCount = data.wearCount ?? 0; // Default to 0 if missing
    
      console.log("Extracted Values:", { placeholder_name, placeholder_size, placeholder_color, placeholder_clothingType, placeholder_brand, placeholder_note, placeholder_wearCount });

      setPlaceholders({
        itemName: placeholder_name,
        size: placeholder_size,
        color: placeholder_color,
        clothingType: placeholder_clothingType,
        brand: placeholder_brand,
        note: placeholder_note,
        wearCount: placeholder_wearCount,
      });
      
    }
  }, [docSnapshot]); // Re-run effect when docSnapshot changes

  const [openSize, setOpenSize] = useState(false);
  const [sizes] = useState([
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ]);

  const [openColor, setOpenColor] = useState(false);
  const [colors] = useState([
    { label: 'Red', value: 'Red' },
    { label: 'Orange', value: 'Orange' },
    { label: 'Yellow', value: 'Yellow' },
    { label: 'Pink', value: 'Pink' },
    { label: 'Purple', value: 'Purple' },
    { label: 'Navy', value: 'Navy' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Green', value: 'Green' },
    { label: 'Black', value: 'Black' },
    { label: 'Gray', value: 'Gray' },
    { label: 'White', value: 'White' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Multicolor', value: 'Multicolor' },
  ]);

  const [openType, setOpenType] = useState(false);
  const [clothingTypes] = useState([
    { label: 'Hat', value: 'Hat' },
    { label: 'Blazer', value: 'Blazer' },
    { label: 'Jacket', value: 'Jacket' },
    { label: 'Sweater', value: 'Sweater' },
    { label: 'T-Shirt', value: 'T-Shirt' },
    { label: 'Top', value: 'Top' },
    { label: 'Dress', value: 'Dress' },
    { label: 'Skirt', value: 'Skirt' },
    { label: 'Jeans', value: 'Jeans' },
    { label: 'Trousers', value: 'Trousers' },
    { label: 'Shorts', value: 'Shorts' },
    { label: 'Socks', value: 'Socks' },
    { label: 'Shoes', value: 'Shoes' },
    { label: 'Swimsuit', value: 'Swimsuit' },
    { label: 'Accessory', value: 'Accessory' },
    { label: 'Other', value: 'Other' },
  ]);

  const [brand, setBrand] = useState(placeholders.brand);
  const [note, setNote] = useState(placeholders.note);
  const [newName, setNewName] = useState(placeholders.itemName)
  const [size, setSize] = useState(placeholders.size);
  const [clothingType, setClothingType] = useState(placeholders.clothingType);
  const [color, setColor] = useState(placeholders.color);
  const [wearCount, setWearCount] = useState(placeholders.wearCount);

  useEffect(() => {
    setBrand(placeholders.brand);
    setNote(placeholders.note);
    setNewName(placeholders.itemName);
    setSize(placeholders.size);
    setClothingType(placeholders.clothingType);
    setColor(placeholders.color);
    setWearCount(placeholders.wearCount);
  }, [placeholders]);

  // FlatList data
  const data = [
    {
      key: 'itemName',
      label: 'Name:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder={"Set name"}
          defaultValue={placeholders.itemName}
          onChangeText={setNewName}
        />
      ),
    },
    {
      key: 'size',
      label: 'Select Size:',
      dropdown: (
        <DropDownPicker
          open={openSize}
          value={size}
          items={sizes}
          setOpen={setOpenSize}
          setValue={setSize}
          placeholder={placeholders.size || "Select size"}
          style={styles.dropdown}
          zIndex={3000}
          listMode={"SCROLLVIEW"}
        />
      ),
    },
    {
      key: 'color',
      label: 'Select Color:',
      dropdown: (
        <DropDownPicker
          open={openColor}
          value={color}
          items={colors}
          setOpen={setOpenColor}
          setValue={setColor}
          placeholder={placeholders.color || "Select color"}
          style={styles.dropdown}
          zIndex={2000}
          listMode={"SCROLLVIEW"}
          searchable={true}
          searchContainerStyle={{borderBottomWidth: 0}}
          searchTextInputStyle={styles.input}
        />
      ),
    },
    {
      key: 'clothingType',
      label: 'Select Clothing Type:',
      dropdown: (
        <DropDownPicker
          open={openType}
          value={clothingType}
          items={clothingTypes}
          setOpen={setOpenType}
          setValue={setClothingType}
          placeholder={placeholders.clothingType || "Select clothing type"}
          style={styles.dropdown}
          zIndex={1000}
          listMode={"SCROLLVIEW"}
          searchable={true}
          searchContainerStyle={{borderBottomWidth: 0}}
          searchTextInputStyle={styles.input}
        />
      ),
    },
    {
      key: 'brand',
      label: 'Brand:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder={"Add brand"}
          defaultValue={placeholders.brand}
          onChangeText={setBrand}
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
          placeholder={"Add note"}
          defaultValue={placeholders.note}
          onChangeText={setNote}
          multiline={true}
        />
      ),
    },
    {
      key: 'submit',
      dropdown: (
        <Button title="Submit" onPress={() => handleClothingSubmit(newName, size, color, clothingType, brand, note, wearCount)} />
      ),
    },
  ];


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{flex: 1}}>
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
      />
    </KeyboardAvoidingView>
  ); 
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allows the FlatList to take up all available space
    justifyContent: 'center', // Centers the content vertically
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdownContainer: {
    marginBottom: 10,
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