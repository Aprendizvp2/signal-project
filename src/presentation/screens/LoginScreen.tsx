// LoginScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { loginDemo } from '../session/sessionSlice';

export const LoginScreen = () => {
    const d = useDispatch<AppDispatch>();
    return (
        <View style={{ flex: 1, justifyContent: 'center', gap: 12, padding: 24 }}>
            <Text>Signal — demo</Text>
            <Button title="Entrar como Coordinator" onPress={() => d(loginDemo('coordinator'))} />
            <Button title="Entrar como Participant" onPress={() => d(loginDemo('participant'))} />
        </View>
    );
};