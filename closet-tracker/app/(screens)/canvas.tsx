import { SafeAreaView, Image } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";

export default function CanvasScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <DraggableResizableImage uri="https://images.vexels.com/media/users/3/234049/isolated/preview/8f2ee5f40718feca247cb3e0f6f4d17a-hoodie-solid-color-clothing.png?w=360"/>
        <DraggableResizableImage uri="https://images.vexels.com/media/users/3/234049/isolated/preview/8f2ee5f40718feca247cb3e0f6f4d17a-hoodie-solid-color-clothing.png?w=360"/>
    </SafeAreaView>
  );
}
