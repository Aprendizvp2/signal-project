import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Alert,
    ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { RootState, AppDispatch } from '../../app/store';
import { sendNote } from '../notes/notesSlice';
import { canSendPriority } from '../../domain/permissions';
import type { NoteKind } from '../../domain/models';
import { CustomButton } from '../components/CustomButton/CustomButton';
import { CustomBackButton } from '../components/CustomBackButton/CustomBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Composer'>;

const PRESETS = ['OK', 'En camino', 'Necesito ayuda'] as const;

export const ComposerScreen = ({ route, navigation }: Props) => {
    const { channelId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const me = useSelector((s: RootState) => s.session.user);
    const channel = useSelector((s: RootState) => s.channel.current);
    const sending = useSelector((s: RootState) => s.notes.sending);

    const [text, setText] = useState('');
    const [preset, setPreset] = useState<string | null>(null);
    const [kind, setKind] = useState<NoteKind>('standard');
    const [recipientId, setRecipientId] = useState<string | null>(null);

    if (!me || !channel) return null;

    const others = channel.participants.filter(p => p.id !== me.id);
    const canPriority = canSendPriority(me.role);

    const doSend = async () => {
        if (!recipientId) {
            Alert.alert('Falta destinatario', 'Elegí a quién enviar la nota.');
            return;
        }
        if (!text.trim() && !preset) {
            Alert.alert('Nota vacía', 'Escribí texto o elegí un preset.');
            return;
        }

        try {
            await dispatch(sendNote({
                channelId,
                recipientId,
                kind,
                actorRole: me.role,
                text: text.trim() || undefined,
                preset: preset ?? undefined,
            })).unwrap();
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Error al enviar', e?.message ?? 'Intentalo de nuevo');
        }
    };

    const onSend = () => {
        if (kind === 'priority') {
            Alert.alert(
                'Confirmar Priority',
                'Esta nota intentará captar atención de forma prioritaria. ¿Enviar?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Enviar', style: 'destructive', onPress: doSend },
                ],
            );
        } else {
            doSend();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <View style={styles.backButton}>
                <CustomBackButton onPress={() => navigation.goBack()} />
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Destinatario</Text>
                <View style={styles.row}>
                    {others.map(u => (
                        <Pressable
                            key={u.id}
                            style={[styles.chip, recipientId === u.id && styles.chipActive]}
                            onPress={() => setRecipientId(u.id)}
                        >
                            <Text style={recipientId === u.id ? styles.chipTextActive : styles.chipText}>
                                {u.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Tipo</Text>
                <View style={styles.row}>
                    <Pressable
                        style={[styles.chip, kind === 'standard' && styles.chipActive]}
                        onPress={() => setKind('standard')}
                    >
                        <Text style={kind === 'standard' ? styles.chipTextActive : styles.chipText}>
                            Standard
                        </Text>
                    </Pressable>
                    {canPriority && (
                        <Pressable
                            style={[styles.chip, kind === 'priority' && styles.chipPriority]}
                            onPress={() => setKind('priority')}
                        >
                            <Text style={kind === 'priority' ? styles.chipTextActive : styles.chipText}>
                                Priority
                            </Text>
                        </Pressable>
                    )}
                </View>
                {!canPriority && (
                    <Text style={styles.hint}>Priority solo disponible para Coordinator.</Text>
                )}

                <Text style={styles.label}>Mensaje</Text>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Escribí una nota…"
                    multiline
                    maxLength={500}
                />

                <Text style={styles.label}>Respuesta rápida</Text>
                <View style={styles.row}>
                    {PRESETS.map(p => (
                        <Pressable
                            key={p}
                            style={[styles.chip, preset === p && styles.chipActive]}
                            onPress={() => setPreset(preset === p ? null : p)}
                        >
                            <Text style={preset === p ? styles.chipTextActive : styles.chipText}>{p}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={{ height: 24 }} />
                <CustomButton variant='primary'
                    title={sending ? 'Enviando…' : (kind === 'priority' ? 'Enviar Priority' : 'Enviar')}
                    onPress={onSend}
                    disabled={sending}
                />
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
    container: { padding: 16, gap: 8 },
    label: { fontWeight: '700', marginTop: 12 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
    chip: {
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 16, backgroundColor: '#eee',
    },
    chipActive: { backgroundColor: '#0057F0' },
    chipPriority: { backgroundColor: '#c00' },
    chipText: { color: '#333' },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
        padding: 12, minHeight: 100, textAlignVertical: 'top',
    },
    hint: { color: '#888', fontSize: 12, fontStyle: 'italic' },
});