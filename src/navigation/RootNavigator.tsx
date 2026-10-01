import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { NoteDetailScreen } from '../presentation/screens/NoteDetailScreen';
import { LoginScreen } from '../presentation/screens/LoginScreen';
import { ChannelScreen } from '../presentation/screens/ChannelScreen';

export type RootStackParamList = {
  Login: undefined;
  Channel: { channelId: string };
  NoteDetail: { channelId: string; noteId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const user = useSelector((s: RootState) => s.session.user);

  return (
    <Stack.Navigator>
      {user == null ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Signal' }} />
      ) : (
        <>
          <Stack.Screen name="Channel" component={ChannelScreen} options={{ title: 'Canal' }} />
          <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: 'Nota' }} />
        </>
      )}
    </Stack.Navigator>
  );
};