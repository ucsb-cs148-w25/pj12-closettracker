import { View, Text, TextInput, ActivityIndicator, Button, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const router = useRouter();

    const signUp = async () => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            router.replace('../(tabs)/wardrobe');
        } catch (error: any) {
            alert('Sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Sign Up</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#007BFF" />
                ) : (
                    <Button title="Create Account" onPress={signUp} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        textAlign: 'center',
    },
});