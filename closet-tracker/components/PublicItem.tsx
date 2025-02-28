import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getDoc, updateDoc, arrayUnion, arrayRemove, increment, doc } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { useUser } from '@/context/UserContext';

export default function PublicItem({ item }: { item: any }) {
  const [userImg, setUserImg] = useState<string>(' ');
  const [userName, setUserName] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [outfitImg, setOutfitImg] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<Date | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const { currentUser } = useUser();

  const handleLike = async (item: any) => {
    if (!currentUser) return;
    const liked = item.likes && item.likes.includes(currentUser.uid);
    try {
      await updateDoc(doc(db, "public", item.id), 
        liked 
          ? { likes: arrayRemove(currentUser.uid), likesCount: increment(-1) } 
          : { likes: arrayUnion(currentUser.uid), likesCount: increment(1) }
      );
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const liked = currentUser && item.likes && item.likes.includes(currentUser.uid);

  useEffect(() => {
    if (item.userRef) {
      getDoc(item.userRef)
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data() as { profilePicture?: string; name?: string };
            setUserImg(data.profilePicture || '');
            setUserName(data.name || 'Unknown');
          }
        })
        .catch(console.error);
    }
    if (item.outfitRef) {
      getDoc(item.outfitRef)
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data() as { itemName: string, image: string, dateUploaded: { seconds: number } };
            setItemName(data.itemName);
            setOutfitImg(data.image);
            if(data.dateUploaded) {
              setLastEdited(new Date(data.dateUploaded.seconds * 1000));
            }
          }
        })
        .catch(console.error);
    }
  }, [item]);

  const handlePress = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await handleLike(item);
    } catch (error) {
      console.error("Error in like/unlike action", error);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <View style={styles.publicItem}>
      <View style={styles.publicItemHeader}>
        <Image source={{ uri: userImg }} style={styles.userImage} />
        <Text style={styles.userName}>{userName}</Text>
      </View>
      {outfitImg ? (
        <Image source={{ uri: outfitImg }} style={styles.outfitImage} resizeMode="contain" />
      ) : null}
      <Text style={styles.itemName}>{itemName}</Text>
      <View style={styles.likeContainer}>
        <TouchableOpacity style={styles.likeButton} onPress={handlePress} disabled={likeLoading}>
          {likeLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.likeButtonText}>{liked ? "Unlike" : "Like"}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.likeCount}>{item.likes ? item.likes.length : 0}</Text>
      </View>
      {lastEdited && (
        <Text style={styles.lastEdited}>Last Edited: {lastEdited.toLocaleDateString()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  publicItem: {
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    width: "100%",
    height: "100%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  publicItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  outfitImage: {
    width: '100%',
    height: '70%',
    borderRadius: 10,
    marginTop: 30,
  },
  itemName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    backgroundColor: '#4160fb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  likeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 14,
  },
  lastEdited: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
