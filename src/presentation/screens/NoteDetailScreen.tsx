// NoteDetailScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

export const NoteDetailScreen = ({ route }: Props) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Note {route.params.noteId}</Text>
        <Text>Channel {route.params.channelId}</Text>
    </View>
);