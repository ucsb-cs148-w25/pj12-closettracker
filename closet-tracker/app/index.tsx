import { useState } from "react";
import { Text, View, Button, Image } from "react-native";
import { useSelectImage, useCameraImage } from "@/hooks/useImagePicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const selectImage = useSelectImage();
  const captureImage = useCameraImage();

  const [image, setImage] = useState<string | null | undefined>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null | undefined>(null);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Select Image" onPress={async () => setImage(await selectImage())} />
      <Button title="Capture Image" onPress={async () => setImage(await captureImage())} />
      {image && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${image}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setImage(null)} />
          {/* <Button title="Remove Background" onPress={() => setImage(null)} /> */}
        </SafeAreaView>
      )}
      {modifiedImage && (
        <SafeAreaView>
          <Image
            source={{ uri: `data:image/png;base64,${modifiedImage}` }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Clear" onPress={() => setModifiedImage(null)} />
        </SafeAreaView>
      )}
    </View>
  );
}
