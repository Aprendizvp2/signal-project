import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { LoginScreen } from '../presentation/screens/LoginScreen';
import { NoteDetailScreen } from '../presentation/screens/NoteDetailScreen';
import { ComposerScreen } from '../presentation/screens/ComposerScreen';
import { ChannelScreen } from '../presentation/screens/ChannelScreen';
export type RootStackParamList = {
  Login: undefined;
  Channel: { channelId: string };
  Composer: { channelId: string };  
  NoteDetail: { channelId: string; noteId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const user = useSelector((s: RootState) => s.session.user);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? 'Channel' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Channel"
        component={ChannelScreen}
        initialParams={{ channelId: 'c-1' }}
      />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="Composer" component={ComposerScreen} />
    </Stack.Navigator>
  );
};