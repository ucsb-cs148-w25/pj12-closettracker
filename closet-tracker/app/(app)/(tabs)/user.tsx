import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/FirebaseConfig';
import { doc, getDoc, updateDoc, collection, onSnapshot, orderBy, query, getCountFromServer } from 'firebase/firestore';
import supabase from '@/supabase';
import { decode } from 'base64-arraybuffer';
import { useUser } from '@/context/UserContext';
import beigeColors from '@/aesthetic/beigeColors';

interface Stat {
  label: string;
  value: string | number | null;
  type: 'text' | 'image';
}

export default function UserProfile() {
  const { currentUser: user } = useUser();
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
    { label: 'Number of Outfits', value: 0, type: 'text' },
  ]);
  const [wardrobeData, setWardrobeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserName(userData?.name || '');
            setDescription(userData?.description || '');
            setImage(userData?.profilePicture || null);
          }

          // Initialize stats array with basic structure
          setStats([
            { label: 'Number of Clothes', value: 0, type: 'text' },
            { label: 'Most Worn Item', value: null, type: 'image' },
            { label: 'Number of Outfits', value: 0, type: 'text' },
          ]);

          // Get outfit count using getCountFromServer
          const outfitsRef = collection(db, 'users', user.uid, 'outfit');
          const outfitCountSnapshot = await getCountFromServer(outfitsRef);
          const outfitCount = outfitCountSnapshot.data().count;
          
          // Update outfit count in stats
          setStats(prevStats => {
            const newStats = [...prevStats];
            const outfitCountIndex = newStats.findIndex(stat => stat.label === 'Number of Outfits');
            if (outfitCountIndex !== -1) {
              newStats[outfitCountIndex].value = outfitCount;
            }
            return newStats;
          });

          // Set up clothing collection listener for dynamic updates
          const wardrobeRef = collection(db, 'users', user.uid, 'clothing');
          const wardrobeQuery = query(wardrobeRef, orderBy('wearCount', 'desc'));
          const unsubscribeWardrobe = onSnapshot(wardrobeQuery, (snapshot) => {
            const wardrobeItems = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setWardrobeData(wardrobeItems);

            // Update clothing-related stats
            setStats(prevStats => {
              const newStats = [...prevStats];
              // Update clothing count
              const clothingCountIndex = newStats.findIndex(stat => stat.label === 'Number of Clothes');
              if (clothingCountIndex !== -1) {
                newStats[clothingCountIndex].value = wardrobeItems.length;
              }
              
              // Update most worn item
              const mostWornIndex = newStats.findIndex(stat => stat.label === 'Most Worn Item');
              if (mostWornIndex !== -1) {
                newStats[mostWornIndex].value = wardrobeItems.length > 0 ? 
                  (wardrobeItems[0] as any).image : null;
              }
              
              return newStats;
            });
          });
          
          // Set up a listener for outfit changes to keep count updated
          const unsubscribeOutfits = onSnapshot(outfitsRef, async () => {
            try {
              // Re-fetch the outfit count when there are changes
              const updatedCountSnapshot = await getCountFromServer(outfitsRef);
              const updatedCount = updatedCountSnapshot.data().count;
              
              setStats(prevStats => {
                const newStats = [...prevStats];
                const outfitCountIndex = newStats.findIndex(stat => stat.label === 'Number of Outfits');
                if (outfitCountIndex !== -1) {
                  newStats[outfitCountIndex].value = updatedCount;
                }
                return newStats;
              });
            } catch (error) {
              console.error("Error updating outfit count:", error);
            }
          });
          
          // Return cleanup function
          return () => {
            unsubscribeWardrobe();
            unsubscribeOutfits();
          };
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      alert('Error signing out: ' + error);
    }
  };

  const uploadProfileImageToSupabase = async (
    base64Image: string,
    userId: string
  ): Promise<string> => {
    try {
      const arrayBuffer = decode(base64Image);
      const fileName = `profile_${Date.now()}.jpg`;
      const filePath = `user_${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profilePictures')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('profilePictures')
        .getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, 
    });

    if (!result.canceled && user) {
      const asset = result.assets[0];
      if (!asset.base64) {
        alert('Failed to retrieve image data.');
        return;
      }
      try {
        const downloadURL = await uploadProfileImageToSupabase(asset.base64, user.uid);
        setEditedImage(downloadURL);
      } catch (error) {
        alert('Failed to upload profile image.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates: Record<string, any> = { description };
      
      if (editedImage) {
        updates.profilePicture = editedImage;
        setImage(editedImage);
      }
      
      await updateDoc(userRef, updates);
      setEditedImage(null);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(originalDescription);
    setEditedImage(null);
    setIsEditing(false);
  };

  const renderProfilePicture = () => {
    const displayImage = editedImage || image;
    
    return (
      <TouchableOpacity 
        onPress={isEditing ? pickImage : undefined}
        style={styles.imageContainer}
      >
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        
        {isEditing && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Change Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={beigeColors.mutedGold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          Welcome, {userName || user?.email}
        </Text>
        
        {renderProfilePicture()}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.statsContainer}>
            {isEditing ? (
              <TextInput
                defaultValue={description}
                style={styles.input}
                onChangeText={setDescription}
                multiline
                placeholder="Write something about yourself..."
                placeholderTextColor={beigeColors.taupe}
              />
            ) : (
              <Text style={styles.descriptionText}>
                {description || 'No description yet.'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Statistics</Text>
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
        </View>

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonHalf]} onPress={handleSaveProfile}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonHalf]} onPress={handleCancelEdit}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setOriginalDescription(description);
                setIsEditing(true);
              }}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: beigeColors.beige,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: beigeColors.darkBeige,
  },
  imageContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: beigeColors.taupe,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: beigeColors.softBrown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: beigeColors.taupe,
  },
  placeholderText: {
    color: beigeColors.taupe,
    fontSize: 16,
    fontWeight: 'bold',
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
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: beigeColors.darkBeige,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: beigeColors.taupe,
    borderRadius: 8,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    color: beigeColors.darkBeige,
  },
  descriptionText: {
    color: beigeColors.brown,
    fontSize: 15,
    width: '100%',
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-around',
    backgroundColor: beigeColors.softBrown,
    borderRadius: 8,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: beigeColors.darkBeige,
  },
  statImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: beigeColors.brown,
    textAlign: 'center',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: beigeColors.taupe,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonHalf: {
    width: '48%',
  },
  buttonText: {
    color: beigeColors.darkBeige,
    fontSize: 16,
  },
});
