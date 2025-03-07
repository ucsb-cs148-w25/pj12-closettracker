import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '@/context/UserContext';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Root() {
  return (
    <GestureHandlerRootView>
      <UserProvider>
        <StatusBar style="dark" />
        <Slot/>
      </UserProvider>
    </GestureHandlerRootView>
  );
}