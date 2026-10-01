export type Role = 'coordinator' | 'participant';

export type NoteKind = 'standard' | 'priority';

export type NoteStatus =
    | 'CREATED' | 'QUEUED' | 'DISPATCHED' | 'DELIVERED'
    | 'OPENED' | 'RESPONDED' | 'FAILED' | 'EXPIRED';

export interface User { id: string; name: string; role: Role; }
export interface Channel { id: string; name: string; participants: User[]; }

export interface Note {
    id: string;
    channelId: string;
    authorId: string;
    recipientId: string;
    kind: NoteKind;
    status: NoteStatus;
    text?: string;
    audioUrl?: string;
    preset?: string;
    replyToId?: string;
    createdAt: string;
    respondedFromDeviceId?: string;
}