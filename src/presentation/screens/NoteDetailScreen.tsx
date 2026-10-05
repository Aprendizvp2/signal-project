import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, Pressable,
    Button, Alert, ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../../app/store';
import { sendNote, loadNotes } from '../notes/notesSlice';
import { loadChannel } from '../channel/channelSlice';
import type { Note } from '../../domain/models';
import { CustomBackButton } from '../components/CustomBackButton/CustomBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const PRESETS = ['OK', 'En camino', 'Necesito ayuda'] as const;

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

export const NoteDetailScreen = ({ route, navigation }: Props) => {
    const { channelId, noteId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const me = useSelector((s: RootState) => s.session.user);
    const channel = useSelector((s: RootState) => s.channel.current);
    const note = useSelector((s: RootState) => s.notes.byId[noteId]);
    const sending = useSelector((s: RootState) => s.notes.sending);
    const notesLoading = useSelector((s: RootState) => s.notes.loading);
    const allNotes = useSelector((s: RootState) =>
        s.notes.ids.map(id => s.notes.byId[id]),
    );

    const [replyPreset, setReplyPreset] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [showReply, setShowReply] = useState(false);

    // Título dinámico
    useEffect(() => {
        navigation.setOptions({
            title: note ? `${note.kind === 'priority' ? '🔴 ' : ''}Nota` : 'Nota',
        });
    }, [navigation, note]);

    // Cargar canal y notas si faltan (deep link con app cerrada)
    useEffect(() => {
        if (!channel) dispatch(loadChannel(channelId));
        if (!note) dispatch(loadNotes(channelId));
    }, [dispatch, channelId, channel, note]);

    // Guards — después de TODOS los hooks
    if (!me) return null;

    if ((!channel || !note) && notesLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Cargando nota…</Text>
            </SafeAreaView>
        );
    }

    if (!channel || !note) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.empty}>Nota no encontrada</Text>
                <Button title="Volver" onPress={() => navigation.goBack()} />
            </SafeAreaView>
        );
    }

    const author = channel.participants.find(p => p.id === note.authorId);
    const recipient = channel.participants.find(p => p.id === note.recipientId);
    const replies = allNotes.filter(n => n.replyToId === note.id);
    const isMine = note.authorId === me.id;
    const isExpired = note.status === 'EXPIRED';
    const alreadyResponded = replies.length > 0;

    const doReply = async () => {
        if (!replyPreset && !replyText.trim()) {
            Alert.alert('Respuesta vacía', 'Elegí un preset o escribí algo.');
            return;
        }
        try {
            await dispatch(sendNote({
                channelId,
                recipientId: note.authorId,
                kind: 'standard',
                actorRole: me.role,
                text: replyText.trim() || undefined,
                preset: replyPreset ?? undefined,
                replyToId: note.id,
            })).unwrap();
            setShowReply(false);
            setReplyText('');
            setReplyPreset(null);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'No se pudo enviar la respuesta');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.backButton}>
                <CustomBackButton onPress={() => navigation.goBack()} />
            </View>
            <ScrollView>
                <View style={styles.headerRow}>
                    <Text style={styles.kind}>
                        {note.kind === 'priority' ? '🔴 PRIORITY' : 'STANDARD'}
                    </Text>
                    <Text style={[styles.status, { color: statusColor(note.status) }]}>
                        {note.status}
                    </Text>
                </View>

                <View style={styles.metaBox}>
                    <Text style={styles.metaLine}>
                        De: <Text style={styles.metaValue}>{author?.name ?? note.authorId}</Text>
                    </Text>
                    <Text style={styles.metaLine}>
                        Para: <Text style={styles.metaValue}>{recipient?.name ?? note.recipientId}</Text>
                    </Text>
                    <Text style={styles.metaLine}>
                        Fecha: <Text style={styles.metaValue}>
                            {new Date(note.createdAt).toLocaleString()}
                        </Text>
                    </Text>
                    {note.respondedFromDeviceId && (
                        <Text style={styles.otherDevice}>
                            ✅ Respondido desde otro dispositivo
                        </Text>
                    )}
                </View>

                {note.text && (
                    <View style={styles.body}>
                        <Text style={styles.bodyLabel}>Mensaje</Text>
                        <Text style={styles.bodyText}>{note.text}</Text>
                    </View>
                )}
                {note.preset && (
                    <View style={styles.body}>
                        <Text style={styles.bodyLabel}>Respuesta rápida</Text>
                        <Text style={styles.preset}>[{note.preset}]</Text>
                    </View>
                )}

                {replies.length > 0 && (
                    <View style={styles.body}>
                        <Text style={styles.bodyLabel}>
                            Respuestas ({replies.length})
                        </Text>
                        {replies.map(r => (
                            <View key={r.id} style={styles.reply}>
                                <Text style={styles.replyText}>
                                    {r.preset ?? r.text}
                                </Text>
                                <Text style={styles.replyMeta}>
                                    {r.status} · {new Date(r.createdAt).toLocaleTimeString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.actions}>
                    {!isMine && !isExpired && !alreadyResponded && !showReply && (
                        <Button title="Responder" onPress={() => setShowReply(true)} />
                    )}

                    {alreadyResponded && (
                        <Text style={styles.done}>Ya respondiste esta nota</Text>
                    )}

                    {isExpired && (
                        <Text style={styles.expired}>Esta nota expiró</Text>
                    )}

                    {showReply && (
                        <View style={styles.replyBox}>
                            <Text style={styles.bodyLabel}>Tu respuesta</Text>
                            <View style={styles.chipRow}>
                                {PRESETS.map(p => (
                                    <Pressable
                                        key={p}
                                        style={[styles.chip, replyPreset === p && styles.chipActive]}
                                        onPress={() => setReplyPreset(replyPreset === p ? null : p)}
                                    >
                                        <Text style={replyPreset === p ? styles.chipTextActive : styles.chipText}>
                                            {p}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Button
                                title={sending ? 'Enviando…' : 'Enviar respuesta'}
                                onPress={doReply}
                                disabled={sending}
                            />
                            <Button title="Cancelar" color="#888" onPress={() => setShowReply(false)} />
                        </View>
                    )}

                    <Button
                        title="Compartir"
                        color="#666"
                        onPress={() => Share.share({
                            message: `signal://note/${channelId}/${noteId}`,
                            url: `signal://note/${channelId}/${noteId}`,
                        })}
                    />
                    <Button
                        title="Volver al timeline"
                        color="#0057F0"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    empty: { fontSize: 16, color: '#888' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kind: { fontWeight: '700', fontSize: 14 },
    status: { fontWeight: '700', fontSize: 14 },
    metaBox: {
        backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4,
    },
    metaLine: { color: '#333', fontSize: 14 },
    metaValue: { fontWeight: '600' },
    otherDevice: { color: '#0a0', fontSize: 12, marginTop: 4 },
    body: { gap: 4 },
    bodyLabel: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
    bodyText: { fontSize: 16 },
    preset: { fontSize: 16, fontStyle: 'italic' },
    reply: {
        backgroundColor: '#eef5ff', borderRadius: 8, padding: 10, marginTop: 6, gap: 2,
    },
    replyText: { fontSize: 15 },
    replyMeta: { fontSize: 11, color: '#666' },
    actions: { gap: 8, marginTop: 12 },
    replyBox: {
        gap: 8, padding: 12, backgroundColor: '#fafafa',
        borderRadius: 8, borderWidth: 1, borderColor: '#eee',
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 16, backgroundColor: '#eee',
    },
    chipActive: { backgroundColor: '#0057F0' },
    chipText: { color: '#333' },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    done: { color: '#0a0', fontWeight: '600', textAlign: 'center' },
    expired: { color: '#888', fontStyle: 'italic', textAlign: 'center' },
});