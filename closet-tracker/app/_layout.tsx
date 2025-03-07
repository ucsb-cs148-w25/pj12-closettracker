import { Slot } from 'expo-router';
import { UserProvider } from '@/context/UserContext';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <UserProvider>
          <Slot/>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}