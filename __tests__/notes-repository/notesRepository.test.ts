import { notesRepository } from '../../src/data/repositories/NotesRepository';
import { db } from '../../src/data/fake/db';
import { AppError } from '../../src/core/errors';

beforeEach(() => {
  // limpiar notas e idempotencia entre tests
  (db as any).notes = {};
  (db as any).idempotency = {};
});

describe('notesRepository (integration con fake API)', () => {
  it('Participant NO puede enviar Priority (403)', async () => {
    await expect(
      notesRepository.send(
        {
          channelId: 'c-1',
          recipientId: 'u-c',
          kind: 'priority',
          actorRole: 'participant',
          text: 'no debería pasar',
        },
        'key-403',
      ),
    ).rejects.toMatchObject({ kind: 'forbidden', status: 403 });
  });

  it('Coordinator SÍ puede enviar Priority', async () => {
    const note = await notesRepository.send(
      {
        channelId: 'c-1',
        recipientId: 'u-p',
        kind: 'priority',
        actorRole: 'coordinator',
        text: 'urgente',
      },
      'key-priority',
    );
    expect(note.kind).toBe('priority');
    expect(note.authorId).toBe('u-c');
  });

  it('misma Idempotency-Key NO duplica la nota', async () => {
    const input = {
      channelId: 'c-1',
      recipientId: 'u-p',
      kind: 'standard' as const,
      actorRole: 'coordinator' as const,
      text: 'una sola vez',
    };
    const a = await notesRepository.send(input, 'same-key');
    const b = await notesRepository.send(input, 'same-key');
    expect(a.id).toBe(b.id);
    expect(Object.keys(db.notes).length).toBe(1);
  });

  it('channel inexistente lanza not_found', async () => {
    await expect(
      notesRepository.send(
        {
          channelId: 'c-404',
          recipientId: 'u-p',
          kind: 'standard',
          actorRole: 'coordinator',
          text: 'x',
        },
        'key-404',
      ),
    ).rejects.toMatchObject({ kind: 'not_found', status: 404 });
  });

  it('list() devuelve notas del canal', async () => {
    await notesRepository.send(
      { channelId: 'c-1', recipientId: 'u-p', kind: 'standard', actorRole: 'coordinator', text: 'a' },
      'k1',
    );
    await notesRepository.send(
      { channelId: 'c-1', recipientId: 'u-p', kind: 'standard', actorRole: 'coordinator', text: 'b' },
      'k2',
    );
    const list = await notesRepository.list('c-1');
    expect(list.length).toBe(2);
  });
});