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
    {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />} 
    <Text style={[styles.itemText, { color: textColor }]}>{item.itemName}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flex: 1,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});