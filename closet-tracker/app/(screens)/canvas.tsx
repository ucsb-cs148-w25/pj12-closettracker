import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import DraggableResizableImage from "@/components/DraggableResizableImage";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/FirebaseConfig";

export default function CanvasScreen() {
  const param = useLocalSearchParams(); // Get query params
  const itemIds = JSON.parse(Array.isArray(param.item) ? param.item[0] : param.item);
  const router = useRouter();
  const [itemUri, setItemUri] = useState<string[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) return;

      console.log("Fetching items with IDs:", itemIds);

      const auth = getAuth(); // Get Firebase Auth instance
      const user = auth.currentUser; // Get the logged-in user

      if (!user) {
        console.error("No user is logged in!");
        return;
      }

      try {
        // Query Firestore to get items where id is in itemIds
        const ClothingRef = collection(db, "users", user.uid, "clothing");
        const q = query(ClothingRef, where("__name__", "in", itemIds));
        const querySnapshot = await getDocs(q);

        // Extract image URLs from the fetched documents
        const fetchedImages = querySnapshot.docs.map((doc) => doc.data().image);

        console.log("Fetched images:", fetchedImages);

        setItemUri(fetchedImages);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {itemUri.length > 0 &&
        itemUri.map((uri, index) => <DraggableResizableImage key={index} uri={uri} />)
      }
    </SafeAreaView>
  );
}
