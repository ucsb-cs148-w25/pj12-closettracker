import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name="singleItem" options={{ headerShown: false }} />
        <Stack.Screen name="editItem" options={{ headerShown: false }} />
        <Stack.Screen name="laundry" options={{ headerShown: false }} />
        <Stack.Screen name="canvas" options={{ headerShown: false }} />
        <Stack.Screen name="createOutfit" options={{ headerShown: false }} />
    </Stack>
  );
}