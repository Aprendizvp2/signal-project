import type { NoteKind, NoteStatus, Role } from '../../domain/models';

export interface UserDTO { id: string; name: string; role: Role; }

export interface ChannelDTO {
    id: string;
    name: string;
    participants: UserDTO[];
}

export interface NoteDTO {
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

export interface SessionResponseDTO { token: string; user: UserDTO; }
export interface CreateNoteDTO {
    channelId: string;
    recipientId: string;
    kind: NoteKind;
    text?: string;
    audioUrl?: string;
    preset?: string;
    replyToId?: string;
}