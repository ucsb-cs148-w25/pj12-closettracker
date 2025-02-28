import { Stack, Redirect } from "expo-router";
import { useUser } from "@/context/UserContext";

export default function RootLayout() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <Redirect href="/auth" />;
  }
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/canvas" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/createOutfit" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/editItem" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/laundry" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)/singleItem" options={{ headerShown: false }} />
      </Stack>
  );
}