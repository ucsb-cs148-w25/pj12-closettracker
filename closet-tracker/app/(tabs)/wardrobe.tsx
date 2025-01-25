import { Image, StyleSheet, Platform } from 'react-native';

import React, {useState} from 'react';
import {FlatList, StatusBar, Text, TouchableOpacity} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

type ItemData = {
    id: string;
    title: string;
  };
  
  const DATA: ItemData[] = [
    {
      id: '1',
      title: 'Shirt',
    },
    {
      id: '2',
      title: 'Cardigan',
    },
    {
      id: '3',
      title: 'Pants',
    },
  ];
  
  type ItemProps = {
    item: ItemData;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
  };
  
  const Item = ({item, onPress, backgroundColor, textColor}: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, {backgroundColor}]}>
      <Text style={[styles.itemText, {color: textColor}]}>{item.title}</Text>
    </TouchableOpacity>
  );

export default function WardrobeScreen() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

  const renderItem = ({item}: {item: ItemData}) => {
    const isSelected = item.id === selectedId;
    const backgroundColor = item.id === selectedId ? '#4160fb' : '#a5b4fd';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => setSelectedId(isSelected ? null : item.id)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.titleContainer}>
        <Text style={styles.title}>Wardrobe</Text>
      </SafeAreaView>
    <SafeAreaView style={styles.clothesContainer}>
      <FlatList style={styles.item}
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedId}
        horizontal={true}
      />
    </SafeAreaView>
</SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: StatusBar.currentHeight || 0,
    marginLeft: 10,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  clothesContainer: {
    gap: 8,
    marginBottom: 8,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemText: {
    fontSize: 20,
  }
});
