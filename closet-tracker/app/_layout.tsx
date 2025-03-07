import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '@/context/UserContext';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Root() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <UserProvider>
          <StatusBar style="dark" />
          <Slot/>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}