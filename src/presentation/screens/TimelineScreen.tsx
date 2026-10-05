import React, { useCallback, useEffect } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, Button,
    StyleSheet, RefreshControl, Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../../app/store';
import { loadNotes, clearNotes } from '../notes/notesSlice';
import { loadChannel } from '../channel/channelSlice';
import { logoutThunk } from '../session/sessionSlice';
import { canInvite } from '../../domain/permissions';
import type { Note } from '../../domain/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Channel'>;

const statusColor = (s: Note['status']) => {
    switch (s) {
        case 'FAILED': return '#c00';
        case 'EXPIRED': return '#888';
        case 'RESPONDED': return '#0a0';
        case 'OPENED':
        case 'DELIVERED': return '#0057F0';
        default: return '#666';
    }
};

export const ChannelScreen = ({ route, navigation }: Props) => {
    const { channelId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const me = useSelector((s: RootState) => s.session.user);
    const channel = useSelector((s: RootState) => s.channel.current);
    const channelLoading = useSelector((s: RootState) => s.channel.loading);
    const notes = useSelector((s: RootState) =>
        s.notes.ids.map(id => s.notes.byId[id]),
    );
    const notesLoading = useSelector((s: RootState) => s.notes.loading);

    useEffect(() => {
        dispatch(loadChannel(channelId));
        dispatch(loadNotes(channelId));
        return () => { dispatch(clearNotes()); };
    }, [dispatch, channelId]);

    const onRefresh = useCallback(() => {
        dispatch(loadChannel(channelId));
        dispatch(loadNotes(channelId));
    }, [dispatch, channelId]);

    if (!me) return null;
    if (channelLoading && !channel) {
        return <View style={styles.center}><ActivityIndicator /></View>;
    }
    if (!channel) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{channel.name}</Text>
                <Text style={styles.sub}>
                    {me.role} · {canInvite(me.role) ? 'puede invitar' : 'sin invitar'}
                </Text>
            </View>

            <FlatList
                data={notes}
                keyExtractor={n => n.id}
                refreshControl={
                    <RefreshControl refreshing={notesLoading} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    notesLoading
                        ? <ActivityIndicator style={{ marginTop: 24 }} />
                        : <Text style={styles.empty}>Sin notas todavía</Text>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.row}
                        onPress={() => navigation.navigate('NoteDetail', { channelId, noteId: item.id })}
                    >
                        <View style={styles.rowTop}>
                            <Text style={styles.kind}>{item.kind.toUpperCase()}</Text>
                            <Text style={[styles.status, { color: statusColor(item.status) }]}>
                                {item.status}
                            </Text>
                        </View>
                        {item.text && <Text style={styles.text}>{item.text}</Text>}
                        {item.preset && <Text style={styles.preset}>[{item.preset}]</Text>}
                        <Text style={styles.meta}>
                            de {item.authorId} → {item.recipientId}
                        </Text>
                    </Pressable>
                )}
            />

            <View style={styles.actions}>
                <Button
                    title="Nueva nota"
                    onPress={() => navigation.navigate('Composer', { channelId })}
                />
                <Button
                    title="Cerrar sesión"
                    color="#a00"
                    onPress={() => dispatch(logoutThunk())}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 8 },
    title: { fontSize: 22, fontWeight: '700' },
    sub: { color: '#666', marginTop: 2 },
    row: {
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
    kind: { fontWeight: '700', color: '#0057F0', fontSize: 12 },
    status: { fontWeight: '600', fontSize: 12 },
    text: { fontSize: 16, marginTop: 4 },
    preset: { fontStyle: 'italic', color: '#666', marginTop: 2 },
    meta: { fontSize: 11, color: '#999', marginTop: 4 },
    empty: { textAlign: 'center', color: '#999', marginTop: 24 },
    actions: { gap: 8, paddingTop: 12 },
});