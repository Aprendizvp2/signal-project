import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Note } from '../../domain/models';
import { notesRepository, SendNoteInput } from '../../data/repositories/NotesRepository';

interface State {
    byId: Record<string, Note>;
    ids: string[];
    loading: boolean;
    sending: boolean;
    error: string | null;
}

const initial: State = { byId: {}, ids: [], loading: false, sending: false, error: null };

export const loadNotes = createAsyncThunk(
    'notes/load',
    async (channelId: string) => notesRepository.list(channelId),
);

export const sendNote = createAsyncThunk(
    'notes/send',
    async (input: SendNoteInput) => {
        // idempotency key estable por intento lógico
        const key = `${input.channelId}:${input.recipientId}:${input.kind}:${Date.now()}`;
        return notesRepository.send(input, key);
    },
);

const slice = createSlice({
    name: 'notes',
    initialState: initial,
    reducers: {
        clearNotes: () => initial,
        setError: (s, a) => { s.error = a.payload; },
    },
    extraReducers: b => {
        b.addCase(loadNotes.pending, s => { s.loading = true; s.error = null; });
        b.addCase(loadNotes.fulfilled, (s, a) => {
            s.loading = false;
            for (const n of a.payload) {
                if (!s.byId[n.id]) s.ids.unshift(n.id);
                s.byId[n.id] = n;
            }
        });
        b.addCase(loadNotes.rejected, (s, a) => {
            s.loading = false;
            s.error = a.error.message ?? 'Error al cargar notas';
        });

        b.addCase(sendNote.pending, s => { s.sending = true; s.error = null; });
        b.addCase(sendNote.fulfilled, (s, a) => {
            s.sending = false;
            const n = a.payload;
            if (!s.byId[n.id]) s.ids.unshift(n.id);   // dedupe
            s.byId[n.id] = n;
        });
        b.addCase(sendNote.rejected, (s, a) => {
            s.sending = false;
            s.error = a.error.message ?? 'Error al enviar';
        });
    },
});

export const { clearNotes, setError } = slice.actions;
export const notesReducer = slice.reducer;