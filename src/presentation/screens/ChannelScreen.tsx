import React, { useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Button,
  StyleSheet, RefreshControl, Pressable, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootState, AppDispatch } from '../../app/store';
import { loadNotes, clearNotes } from '../notes/notesSlice';
import { loadChannel } from '../channel/channelSlice';
import { logoutThunk } from '../session/sessionSlice';
import { canInvite, canSendPriority } from '../../domain/permissions';
import type { Note } from '../../domain/models';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { notificationService } from '../../services/notifications/NotificationService';

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

  const simulatePriority = () => {
    const lastNote = notes[0];
    if (!lastNote) {
      Alert.alert('No hay notas', 'Creá una nota primero.');
      return;
    }
    notificationService.schedulePriority(
      {
        channelId,
        noteId: lastNote.id,
        title: '🔴 Priority',
        body: lastNote.text ?? lastNote.preset ?? 'Nueva señal prioritaria',
      },
      3000,
    );
    Alert.alert(
      'Notificación programada',
      'Llega en 3 segundos. Poné la app en background (⌘⇧H en simulador).',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        renderItem={({ item }) => {
          const author = channel.participants.find(p => p.id === item.authorId);
          const isMine = item.authorId === me.id;
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate('NoteDetail', { channelId, noteId: item.id })}
            >
              <View style={styles.rowTop}>
                <Text style={styles.kind}>
                  {item.kind === 'priority' ? '🔴 PRIORITY' : 'STANDARD'}
                </Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>

              <Text style={styles.author}>
                {isMine ? 'Vos' : author?.name ?? item.authorId} → {item.recipientId}
              </Text>

              {item.text && (
                <Text style={styles.text} numberOfLines={2}>{item.text}</Text>
              )}
              {item.preset && <Text style={styles.preset}>[{item.preset}]</Text>}

              <View style={styles.rowFooter}>
                <Text style={styles.meta}>
                  {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
                <Text style={styles.chevron}>Ver detalle ›</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.actions}>
        <Button
          title="Nueva nota"
          onPress={() => navigation.navigate('Composer', { channelId })}
        />
        {canSendPriority(me.role) && (
          <Button
            title="🔔 Simular Priority entrante"
            color="#c00"
            onPress={simulatePriority}
          />
        )}
        <Button
          title="Cerrar sesión"
          color="#a00"
          onPress={() => dispatch(logoutThunk())}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { color: '#666', marginTop: 2 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  kind: { fontWeight: '700', color: '#0057F0', fontSize: 12 },
  status: { fontWeight: '600', fontSize: 12 },
  text: { fontSize: 16, marginTop: 4 },
  preset: { fontStyle: 'italic', color: '#666', marginTop: 2 },
  meta: { fontSize: 11, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 24 },
  actions: { gap: 8, paddingTop: 12 },
  rowPressed: { backgroundColor: '#f5f9ff' },
  author: { fontSize: 12, color: '#666', marginTop: 2 },
  rowFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 6,
  },
  chevron: { color: '#0057F0', fontWeight: '600', fontSize: 13 },
});