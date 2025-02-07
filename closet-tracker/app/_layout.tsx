import { Stack } from "expo-router";
import { GestureHandlerRootView, NativeViewGestureHandler } from "react-native-gesture-handler";
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" /> {/* Not Found Screen */}
      </Stack>
    </GestureHandlerRootView>
  );
}