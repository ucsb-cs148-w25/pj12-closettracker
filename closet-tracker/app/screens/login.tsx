import { View, Text, TextInput, ActivityIndicator, Button } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig'; // Ensure correct Firebase config import
import { ScrollView } from 'react-native-gesture-handler';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null); // Add state to hold user info

    const signIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log(userCredential);
            setUser(userCredential.user); // Store user in state after successful login
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log(userCredential);
            setUser(userCredential.user); // Store user in state after successful signup
        } catch (error: any) {
            console.log(error);
            alert('Sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView>
            <ScrollView>
                <Text>Login</Text>
                <TextInput
                    placeholder="email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <Button title="Login" onPress={signIn} />
                        <Button title="Create Account" onPress={signUp} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;
