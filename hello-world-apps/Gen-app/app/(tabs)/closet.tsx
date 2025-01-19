import { Text, StyleSheet, FlatList, TouchableHighlight } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClosetScreen() {
  let closet1 = [
    "shirt1",
    "shirt2",
    "shirt3",
  ]
  let closet2 = [
    "pants1",
    "pants2",
    "pants3",
    "pants4",
  ]

  return (
    <SafeAreaView style={styles.container}>
      <FlatList 
        style={styles.flatlist} 
        data={closet1} 
        contentContainerStyle={styles.flatlistContainer} 
        renderItem={({item}) => (
          <TouchableHighlight onPress={() => console.log(item)} style={styles.items}>
            <Text>{item}</Text>
          </TouchableHighlight>
      )} />
      
      <FlatList 
        style={styles.flatlist} 
        data={closet2} 
        contentContainerStyle={styles.flatlistContainer} 
        renderItem={({item}) => (
          <TouchableHighlight onPress={() => console.log(item)} style={styles.items}>
            <Text>{item}</Text>
          </TouchableHighlight>
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  flatlist: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  flatlistContainer: {
    flex: 1,
  },
  items: {
    flex: 1,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    margin: "5%",
    padding: 5,
    backgroundColor: "white",
  },
});