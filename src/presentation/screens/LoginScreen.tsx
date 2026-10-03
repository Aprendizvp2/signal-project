// LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { loginDemo } from '../session/sessionSlice';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';


type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.session);

    const onLogin = async (role: 'coordinator' | 'participant') => {
        try {
            await dispatch(loginDemo(role)).unwrap();
            navigation.replace('Channel', { channelId: 'c-1' });
        } catch {
            // error ya está en el slice
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Signal</Text>
            {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}
            {error && <Text style={styles.err}>{error}</Text>}
            <Pressable style={styles.buttonCoordinator} onPress={() => onLogin('coordinator')}>
                <Text style={styles.buttonText}>Coordinator</Text>
            </Pressable>
            <Pressable style={styles.buttonParticipant} onPress={() => onLogin('participant')}>
                <Text style={styles.buttonText}>Participant</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginVertical: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonCoordinator: {
        backgroundColor: '#0057F0',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonParticipant: {
        backgroundColor: '#6A717D',
        padding: 12,
        borderRadius: 8,
    },
    err: {
        color: "red"
    }
});