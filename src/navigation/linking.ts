import type { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<any> = {
  prefixes: ['signal://', 'https://signal.local'],
  config: {
    screens: {
      NoteDetail: 'note/:channelId/:noteId',
    },
  },
};