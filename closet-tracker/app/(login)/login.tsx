import { View, Text, TextInput, ActivityIndicator, Button, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import beigeColors from '../aesthetic/beigeColors';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                router.replace('../(tabs)/wardrobe');
            }
        });
        return unsubscribe;
    }, []);

    const router = useRouter();

    const signIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            router.replace('../(tabs)/wardrobe');
        } catch (error: any) {
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Sign In</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#FFFFFF"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#FFFFFF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={beigeColors.mutedGold} />
                ) : (
                    <View style={styles.button}>
                        <Text style={styles.buttonText} onPress={signIn}>Login</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: beigeColors.beige, // Beige background
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF', // White text for contrast
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: beigeColors.taupe, // Darker brown border
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: beigeColors.softBrown, // Dark brown input fields
        color: '#FFFFFF', // White text inside input fields
    },
    button: {
        backgroundColor: beigeColors.taupe, // Dark brownish-grey button
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF', // White button text
        fontSize: 16,
        fontWeight: 'bold',
    },
});
