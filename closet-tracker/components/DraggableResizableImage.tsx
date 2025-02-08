import React, { useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";


// Initial size (relative to screen)
const INITIAL_SIZE = 0.5;
const MIN_SIZE = 0.2;
const MAX_SIZE = 0.8;

// Utility function to clamp values within a range
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function DraggableResizableImage(props: {  uri: string }) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  Image.getSize(props.uri, (width, height) => { setImageSize({ width, height }) });
  
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  // Scale values for pinch resizing
  const scale = useSharedValue(INITIAL_SIZE);
  const startScale = useSharedValue(0);

  // Drag Gesture
  const dragGesture = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      translationX.value = prevTranslationX.value + event.translationX;
      translationY.value = prevTranslationY.value + event.translationY;
    })
    .runOnJS(true);

  // Pinch Gesture for resizing (maintaining aspect ratio)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(
        startScale.value * event.scale,
        MIN_SIZE,
        MAX_SIZE
      );
    })
    .runOnJS(true);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
    width: imageSize.width,
    height: imageSize.height,
    pointerEvents: "auto",
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(dragGesture, pinchGesture)}>
        <Animated.View style={animatedStyle} >
          <Image source={{ uri: props.uri }} style={{ width: '100%', height: '100%', backgroundColor: "black" }} />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
