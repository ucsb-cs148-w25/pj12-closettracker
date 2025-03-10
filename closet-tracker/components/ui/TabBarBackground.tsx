import { View, StyleSheet } from 'react-native';
import beigeColors from '@/aesthetic/beigeColors';

export default function TabBarBackground() {
  return (
    <View style={styles.background} />
  );
}

export function useBottomTabOverflow() {
  return 0;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: beigeColors.darkBeige,
  },
});
