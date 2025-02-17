import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

type ClothingItemProps = {
  item: { id: string; itemName: string; image: string };
  onPress: () => void;
  onLongPress: () => void;
  backgroundColor: string;
  textColor: string;
};

export const ClothingItem = ({ item, onPress, onLongPress, backgroundColor, textColor }: ClothingItemProps) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.item, { backgroundColor }]}> 
    {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode='contain'/>} 
    <Text style={[styles.itemText, { color: textColor }]}>{item.itemName}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: "90%",
    height: "80%",
    borderRadius: 8,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});