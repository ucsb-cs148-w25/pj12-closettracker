import React, { useState } from 'react';
import { FlatList, Text, StyleSheet, TextInput, Button, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';


const clothingDataDropdowns = ({
    handleSubmit,
    name,
  }: {
    handleSubmit: (
        name: string | null,
        size: string | null,
        color: string | null, 
        clothingType: string | null, 
        brand: string, note: string
    ) => Promise<void>; //for asynch?
    name: string | null;
  }) => {
  const [openSize, setOpenSize] = useState(false);
  const [size, setSize] = useState(null);
  const [sizes] = useState([
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ]);

  const [openColor, setOpenColor] = useState(false);
  const [color, setColor] = useState(null);
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
  ]);

  const [openType, setOpenType] = useState(false);
  const [clothingType, setClothingType] = useState(null);
  const [clothingTypes] = useState([
    { label: 'T-Shirt', value: 'T-Shirt' },
    { label: 'Top', value: 'Top' },
    { label: 'Jeans', value: 'Jeans' },
    { label: 'Trousers', value: 'Trousers' },
    { label: 'Shorts', value: 'Shorts' },
    { label: 'Jacket', value: 'Jacket' },
    { label: 'Socks', value: 'Socks' },
    { label: 'Shoes', value: 'Shoes' },
    { label: 'Hat', value: 'Hat' },
  ]);

  const [brand, setBrand] = useState('');
  const [note, setNote] = useState('');
  const [newName, setNewName] = useState(name || '')
  // FlatList data
const data = [
    {
      key: 'name',
      label: 'Name:',
      dropdown: (
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          placeholder={name || 'Enter your name'}
          value={newName}
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
          placeholder="Select a size"
          style={styles.dropdown}
          zIndex={3}
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
          placeholder="Select a color"
          style={styles.dropdown}
          zIndex={2}
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
          placeholder="Select clothing type"
          style={styles.dropdown}
          zIndex={1}
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
          placeholder="Enter brand"
          value={brand}
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
        <Button title="Submit" onPress={() => handleSubmit(newName, size, color, clothingType, brand, note)} />
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
      />
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
  
  export default clothingDataDropdowns;