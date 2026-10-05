import { fakeApi } from '../fake/handlers';
import type { Note, NoteKind } from '../../domain/models';
import { NoteDTO } from '../types/types';

const mapNote = (d: NoteDTO): Note => ({
    id: d.id,
    channelId: d.channelId,
    authorId: d.authorId,
    recipientId: d.recipientId,
    kind: d.kind,
    status: d.status,
    text: d.text,
    audioUrl: d.audioUrl,
    preset: d.preset,
    replyToId: d.replyToId,
    createdAt: d.createdAt,
    respondedFromDeviceId: d.respondedFromDeviceId,
});

export interface SendNoteInput {
    channelId: string;
    recipientId: string;
    kind: NoteKind;
    actorRole: 'coordinator' | 'participant';
    text?: string;
    preset?: string;
    audioUrl?: string;
    replyToId?: string;
}

export interface NotesRepository {
    list(channelId: string): Promise<Note[]>;
    get(noteId: string): Promise<Note>;
    send(input: SendNoteInput, idempotencyKey: string): Promise<Note>;
}

export const notesRepository: NotesRepository = {
    async list(channelId) {
        const dtos = await fakeApi.listNotes(channelId);
        return dtos.map(mapNote);
    },
    async get(noteId) {
        return mapNote(await fakeApi.getNote(noteId));
    },
    async send(input, idempotencyKey) {
        const dto = await fakeApi.createNote(input, idempotencyKey, input.actorRole);
        return mapNote(dto);
    },
};