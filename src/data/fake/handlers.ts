import { AppError } from '../../core/errors';
import { canSendPriority } from '../../domain/permissions';
import { db } from './db';
import type {
  ChannelDTO, CreateNoteDTO, NoteDTO, SessionResponseDTO,
} from '../types/types';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

export const fakeApi = {
  async login(role: 'coordinator' | 'participant'): Promise<SessionResponseDTO> {
    await delay();
    const user = role === 'coordinator' ? db.users['u-c'] : db.users['u-p'];
    return { token: `demo-${user.id}-${Date.now()}`, user };
  },

  async getChannel(channelId: string): Promise<ChannelDTO> {
    await delay();
    const ch = db.channels[channelId];
    if (!ch) throw new AppError('not_found', 'Channel no existe', 404);
    return ch;
  },

  async createNote(dto: CreateNoteDTO, idempotencyKey: string): Promise<NoteDTO> {
    await delay(400);

    // idempotencia
    if (db.idempotency[idempotencyKey]) {
      return db.notes[db.idempotency[idempotencyKey]];
    }

    const ch = db.channels[dto.channelId];
    if (!ch) throw new AppError('not_found', 'Channel no existe', 404);

    const author = Object.values(db.users).find(u => u.id === dto.recipientId || u.id === 'u-c');
    // validación de permiso — la regla dura
    const authorRole = dto.kind === 'priority' && !canSendPriority('coordinator')
      ? 'participant' : 'coordinator';

    if (dto.kind === 'priority' && authorRole === 'participant') {
      throw new AppError('forbidden', 'Priority solo para Coordinator', 403);
    }

    const note: NoteDTO = {
      id: uid(),
      channelId: dto.channelId,
      authorId: 'u-c',
      recipientId: dto.recipientId,
      kind: dto.kind,
      status: 'QUEUED',
      text: dto.text,
      audioUrl: dto.audioUrl,
      preset: dto.preset,
      replyToId: dto.replyToId,
      createdAt: new Date().toISOString(),
    };
    db.notes[note.id] = note;
    db.idempotency[idempotencyKey] = note.id;

    // simular transición de estados
    setTimeout(() => { note.status = 'DISPATCHED'; }, 1000);
    setTimeout(() => { note.status = 'DELIVERED'; }, 2000);

    return note;
  },

  async listNotes(channelId: string): Promise<NoteDTO[]> {
    await delay();
    return Object.values(db.notes)
      .filter(n => n.channelId === channelId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getNote(noteId: string): Promise<NoteDTO> {
    await delay();
    const n = db.notes[noteId];
    if (!n) throw new AppError('not_found', 'Nota no existe', 404);
    return n;
  },

  async acceptInvite(token: string): Promise<ChannelDTO> {
    await delay();
    const inv = db.invites[token];
    if (!inv) throw new AppError('not_found', 'Invite inválida', 404);
    if (inv.used) throw new AppError('conflict', 'Invitación ya usada', 409);
    inv.used = true;
    return db.channels[inv.channelId];
  },
};