import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name="ClothingTracker" options={{ headerShown: false }} />
    </Stack>
  );
}