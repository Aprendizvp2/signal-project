import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { loginDemo } from '../session/sessionSlice';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../components/CustomButton/CustomButton';
import { CustomText } from '../components/CustomText/CustomText';


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
            <CustomText style={styles.title} text="Welcome to Signal" />
            {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}
            {error && <Text style={styles.err}>{error}</Text>}
            <CustomButton variant='primary' title='Coordinator' onPress={() => onLogin('coordinator')} />
            <CustomButton variant='secondary' title='Participant' onPress={() => onLogin('participant')} />
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
    err: {
        color: "red"
    }
});