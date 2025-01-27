import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import Login from './screens/login';
import {User, onAuthStateChanged} from 'firebase/auth'
import { auth } from '@/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';

import TabsLayout from './(tabs)/_layout';


const Stack = createNativeStackNavigator();

export default function Index() {
    const [user, setUser] = useState<User | null> (null);
    const navigation = useNavigation();

    useEffect(() =>{
        onAuthStateChanged(auth, (user)=>{
            console.log('user', user);
            setUser(user)
            if (user) {
                navigation.navigate('(tabs)');
            }
        });
    },[])

    return (
    <Stack.Navigator initialRouteName='Login'>
        {user ? (
            <Stack.Screen
            name="(tabs)"
            component={TabsLayout} // Use the TabsLayout component here
            options={{ headerShown: false }}
            />
        ) : (
            <Stack.Screen name='Login' component={Login} options={{ headerShown: false }}></Stack.Screen>
        )}
    </Stack.Navigator>
    );
}