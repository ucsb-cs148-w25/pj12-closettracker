import React, { useEffect, useState } from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
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

export default function DraggableResizableImage({ 
  uri, 
  onTransformChange, 
  initialTransform 
}: { 
  uri: string; 
  onTransformChange?: (transform: { translationX: number; translationY: number; scale: number }) => void; 
  initialTransform?: { translationX: number; translationY: number; scale: number }  
}) {
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 }); // Default size
  const { width: ScreenWidth } = useWindowDimensions();

  useEffect(() => {
    if (uri) {
      Image.getSize(uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  }, [uri]);

  // Initialize with provided transform values or defaults
  const translationX = useSharedValue(initialTransform?.translationX ?? 0);
  const translationY = useSharedValue(initialTransform?.translationY ?? 0);
  const prevTranslationX = useSharedValue(translationX.value);
  const prevTranslationY = useSharedValue(translationY.value);
  const scale = useSharedValue(initialTransform?.scale ?? INITIAL_SIZE);
  const startScale = useSharedValue(0);

  // Also update shared values when initialTransform changes
  useEffect(() => {
    if (initialTransform) {
      translationX.value = initialTransform.translationX;
      translationY.value = initialTransform.translationY;
      scale.value = initialTransform.scale;
    }
  }, [initialTransform]);

  // Function to update transform via callback
  const updateTransform = () => {
    if (onTransformChange) {
      runOnJS(onTransformChange)({
        translationX: translationX.value,
        translationY: translationY.value,
        scale: scale.value,
      });
    }
  };

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
    .onEnd(() => {
      updateTransform();
    })
    .runOnJS(true);

  // Pinch Gesture for resizing (maintaining aspect ratio)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(startScale.value * event.scale, MIN_SIZE, MAX_SIZE);
    })
    .onEnd(() => {
      updateTransform();
    })
    .runOnJS(true);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
    width: ScreenWidth,
    height: ScreenWidth * (imageSize.height / imageSize.width),
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(dragGesture, pinchGesture)}>
        <Animated.View style={animatedStyle}>
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
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
    position: "absolute",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
