import type { ChannelDTO, NoteDTO, UserDTO } from '../types/types';

export const db = {
    users: {
        'u-c': { id: 'u-c', name: 'Coordinator Demo', role: 'coordinator' } as UserDTO,
        'u-p': { id: 'u-p', name: 'Participant Demo', role: 'participant' } as UserDTO,
    },
    channels: {} as Record<string, ChannelDTO>,
    notes: {} as Record<string, NoteDTO>,
    idempotency: {} as Record<string, string>, // key -> noteId
    invites: {} as Record<string, { channelId: string; used: boolean }>,
    devices: {} as Record<string, { userId: string; lastPulse: string }>,
};

// canal demo precargado
db.channels['c-1'] = {
    id: 'c-1',
    name: 'Canal Demo',
    participants: [db.users['u-c'], db.users['u-p']],
};