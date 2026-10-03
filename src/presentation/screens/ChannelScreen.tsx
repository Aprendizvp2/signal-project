import React, { useEffect } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, Button,
    StyleSheet, RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../../app/store';
import { loadChannel, clearChannel } from '../channel/channelSlice';
import { logoutThunk } from '../session/sessionSlice';
import { canInvite, canSendPriority } from '../../domain/permissions';

type Props = NativeStackScreenProps<RootStackParamList, 'Channel'>;

export const ChannelScreen = ({ route }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { current, loading, error } = useSelector((s: RootState) => s.channel);
    const me = useSelector((s: RootState) => s.session.user);

    useEffect(() => {
        dispatch(loadChannel(route.params.channelId));
        return () => { dispatch(clearChannel()); };
    }, [dispatch, route.params.channelId]);

    if (!me) return null;

    if (loading && !current) {
        return <View style={styles.center}><ActivityIndicator /></View>;
    }
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.err}>{error}</Text>
                <Button title="Reintentar" onPress={() => dispatch(loadChannel(route.params.channelId))} />
            </View>
        );
    }
    if (!current) {
        return <View style={styles.center}><Text>Canal vacío</Text></View>;
    }

    const isCoordinator = me?.role === 'coordinator';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{current.name}</Text>
                <Text style={styles.sub}>
                    Tu rol: {me?.role} · {isCoordinator ? 'puede invitar' : 'sin permiso de invitar'}
                    {' · '}
                    {canSendPriority(me!.role) ? 'puede Priority' : 'sin Priority'}
                </Text>
            </View>

            <FlatList
                data={current.participants}
                keyExtractor={u => u.id}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => { void dispatch(loadChannel(route.params.channelId)); }}
                    />
                }
                ListEmptyComponent={<Text style={styles.empty}>Sin participantes</Text>}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.role}>{item.role}</Text>
                        <Text style={styles.status}>desconocido</Text>
                    </View>
                )}
            />

            <View style={styles.actions}>
                <Button
                    title="Pulse silencioso"
                    onPress={() => {/* TODO: device pulse */ }}
                />
                {canInvite(me!.role) && (
                    <Button title="Invitar" onPress={() => {/* TODO */ }} />
                )}
                <Button title="Cerrar sesión" color="#a00" onPress={() => dispatch(logoutThunk())} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        marginBottom: 12
    },
    title: {
        fontSize: 22,
        fontWeight: '700'
    },
    sub: {
        color: '#666',
        marginTop: 4
    },
    row: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    name: {
        fontSize: 16,
        fontWeight: '600'
    },
    role: {
        color: '#444'
    },
    status: {
        color: '#999',
        fontSize: 12
    },
    empty: {
        textAlign: 'center',
        color: '#999',
        marginTop: 24
    },
    err: {
        color: '#a00',
        marginBottom: 12
    },
    actions: {
        gap: 8,
        paddingTop: 12
    },
});