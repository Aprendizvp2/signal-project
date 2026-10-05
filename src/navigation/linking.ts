import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['signal://', 'https://signal.local'],
  config: {
    screens: {
      Login: 'login',
      Channel: 'channel/:channelId',
      Composer: 'compose/:channelId',
      NoteDetail: 'note/:channelId/:noteId',
    },
  },
};