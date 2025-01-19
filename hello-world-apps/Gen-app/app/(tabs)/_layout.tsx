import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{title: "Hello"}}/>
      <Tabs.Screen name="outfits" options={{title: "Outfits"}}/>
      <Tabs.Screen name="closet" options={{title: "Closet"}}/>
    </Tabs>
  )
}
