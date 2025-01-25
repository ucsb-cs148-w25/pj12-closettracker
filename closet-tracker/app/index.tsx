import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { TextInput } from 'react-native-gesture-handler';

const index = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password)
            // if(user) router.replace('/(tabs)');
        } catch (error: any) {
            console.log(error)
            alert('Sign in failed' + error.message);
        }
    }

    const signUp = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password)
            // if(user) router.replace('/(tabs)');
        } catch (error: any) {
            console.log(error)
            alert('Sign up failed' + error.message);
        }
    }

    return(
        <SafeAreaView>
            <Text>Index</Text>
            <TextInput placeholder='email' value={email} onChangeText={setEmail}></TextInput>
            <TextInput placeholder='password' value={password} onChangeText={setPassword}></TextInput>
            <TouchableOpacity onPress={signIn}>
                <Text>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signUp}>
                <Text>Make Account</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default index