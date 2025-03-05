import { Text, TextInput, ActivityIndicator, TouchableHighlight, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/FirebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import beigeColors from '@/aesthetic/beigeColors';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const signUp = async () => {
        setLoading(true);
        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: name,
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            });

            router.replace('/');
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
                    placeholder="Name"
                    placeholderTextColor="#FFFFFF"
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#FFFFFF"
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#FFFFFF"
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={beigeColors.mutedGold} />
                ) : (
                    <TouchableHighlight style={styles.button} onPress={signUp}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableHighlight>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: beigeColors.beige,
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
        color: '#FFFFFF',
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: beigeColors.taupe,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: beigeColors.softBrown,
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: beigeColors.taupe,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
