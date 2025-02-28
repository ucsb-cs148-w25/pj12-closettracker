import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';

interface Stat {
  label: string;
  value: string | number | null;
  type: 'text' | 'image';
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Number of Clothes', value: 0, type: 'text' },
    { label: 'Most Worn Item', value: null, type: 'image' },
  ]);
  const [wardrobeData, setWardrobeData] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoading(false);
      if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(userData?.name || '');
          setDescription(userData?.description || '');
          setImage(userData?.profilePicture || null);
        }

        const wardrobeRef = collection(db, 'users', authUser.uid, 'clothing');
        const q = query(wardrobeRef, orderBy('wearCount', 'desc'));
        const unsubscribeWardrobe = onSnapshot(q, (snapshot) => {
          const wardrobeItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWardrobeData(wardrobeItems);

          setStats([
            { label: 'Number of Clothes', value: wardrobeItems.length, type: 'text' },
            {
              label: 'Most Worn Item',
              value:
                wardrobeItems.length > 0
                  ? (wardrobeItems[0] as any).image // TODO: need wearCount metadata or update this stat accordingly
                  : null,
              type: 'image',
            },
          ]);
        });

        return () => unsubscribeWardrobe();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  const uploadProfileImageToSupabase = async (
    base64Image: string,
    userId: string
  ): Promise<string> => {
    const arrayBuffer = decode(base64Image);
    const fileName = `profile_${Date.now()}.jpg`;
    const filePath = `user_${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profilePictures')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
      });
    
    if (uploadError) {
      console.error('Supabase profile image upload error:', uploadError);
      throw uploadError;
    }
    
    const { data: urlData } = supabase.storage
      .from('profilePictures')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, 
    });

    if (!result.canceled && user) {
      const asset = result.assets[0];
      if (!asset.base64) {
        alert('Failed to retrieve base64 image data.');
        return;
      }
      try {
        const downloadURL = await uploadProfileImageToSupabase(asset.base64, user.uid);
        setEditedImage(downloadURL);
      } catch (error) {
        console.error('Error uploading profile image: ', error);
        alert('Failed to upload profile image.');
      }
    }
  };

  const saveProfilePicture = async (downloadURL: string) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { profilePicture: downloadURL });
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      if (editedImage) {
        await saveProfilePicture(editedImage);
        setImage(editedImage);
      }
      await updateDoc(doc(db, 'users', user.uid), { description });
      setEditedImage(null);
      setIsEditing(false);
    }
  };

  // if press cancel, revert back to original description and pfp
  const handleCancelEdit = () => {
    setDescription(originalDescription);
    setEditedImage(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  const renderProfilePicture = () => {
    const displayImage = editedImage || image;
    const imageComponent = displayImage ? (
      <Image source={{ uri: displayImage }} style={styles.profileImage} />
    ) : (
      <View style={styles.profileImagePlaceholder} />
    );

    if (isEditing) {
      return (
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.editableProfileImageContainer}>
            {imageComponent}
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Change Photo</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return imageComponent;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Text style={styles.title}>
            Welcome, {userName || user?.email}!
          </Text>
          {renderProfilePicture()}
          <View style={styles.descriptionContainer}>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                multiline
                autoCapitalize="none"
                placeholder="Write something about yourself..."
              />
            ) : (
              <Text style={styles.descriptionText}>
                {description || 'No description yet.'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              {stat.type === 'text' ? (
                <Text style={styles.statValue}>{stat.value}</Text>
              ) : stat.value ? (
                <Image
                  source={{ uri: stat.value as string }}
                  style={styles.statImage}
                />
              ) : (
                <Text style={styles.statValue}>N/A</Text>
              )}
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.editContainer}>
          {isEditing ? (
            <>
              <Button title="Save" onPress={handleSaveProfile} />
              <Button title="Cancel" onPress={handleCancelEdit} />
            </>
          ) : (
            <Button
              title="Edit Profile"
              // saving current pfp and description in case user cancels
              onPress={() => {
                setEditedImage(image);
                setOriginalDescription(description);
                setIsEditing(true);
              }}
            />
          )}
        </View>

        <View style={styles.logOutContainer}>
          <Button title="Log Out" onPress={handleSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  editableProfileImageContainer: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#888',
  },
  descriptionContainer: {
    marginTop: 20,
    width: '100%',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  descriptionText: {
    minHeight: 100,
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  editContainer: {
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    marginTop: 20,
  },
  logOutContainer: {
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
});
