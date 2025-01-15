import { Text, View, StyleSheet } from "react-native";

export default function WorldScreen() {
  return (
    <View
      style={styles.container}
    >
      <Text>World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});