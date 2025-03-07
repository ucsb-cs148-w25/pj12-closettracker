// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  "person.fill": "people-alt",
  "shippingbox.fill": "archive",
  "trash": "delete-outline",
  "xmark.app": "cancel",
  "xmark.circle": "cancel",
  "washer.fill": "local-laundry-service",
  "pencil.and.list.clipboard": "assignment-add",
  "hanger": "curtains-closed",
  "plus.circle" : "add-circle",
  "plus" : "add",
  "tshirt.fill" : "local-laundry-service",
  "arrow.uturn.backward" : "keyboard-backspace",
  "pencil" : "edit",
  "line.horizontal.3.decrease.circle" : "filter-list",
  "heart" : "favorite",
  "heart.fill" : "favorite-border",
  "camera": "camera-alt",
  "folder": "folder-copy",
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
