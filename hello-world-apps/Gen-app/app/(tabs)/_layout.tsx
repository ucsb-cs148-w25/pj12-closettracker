import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{title: "Hello"}}/>
      <Tabs.Screen name="world" options={{title: "World"}}/>
    </Tabs>
  )
}
