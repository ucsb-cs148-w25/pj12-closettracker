import { View, Text, TextInput, ActivityIndicator, TouchableHighlight, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import beigeColors from '@/aesthetic/beigeColors';

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
                    placeholderTextColor={beigeColors.taupe}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={beigeColors.taupe}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={beigeColors.mutedGold} />
                ) : (
                    <TouchableHighlight style={styles.button} onPress={signIn}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableHighlight>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: beigeColors.lightBeige,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        marginBottom: 20,
        textAlign: 'center',
        color: beigeColors.darkBeige,
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
        color: beigeColors.darkBeige,
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
        color: beigeColors.darkBeige,
        fontSize: 16,
    },
});
