import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Note } from '../../domain/models';

interface State {
    byId: Record<string, Note>;
    ids: string[];
    loading: boolean;
    error: string | null;
}

const initial: State = { byId: {}, ids: [], loading: false, error: null };

const slice = createSlice({
    name: 'notes',
    initialState: initial,
    reducers: {
        upsertNote: (s, a: PayloadAction<Note>) => {
            const n = a.payload;
            if (!s.byId[n.id]) s.ids.unshift(n.id); // dedupe por id
            s.byId[n.id] = n;
        },
        upsertMany: (s, a: PayloadAction<Note[]>) => {
            for (const n of a.payload) {
                if (!s.byId[n.id]) s.ids.unshift(n.id);
                s.byId[n.id] = n;
            }
        },
        setLoading: (s, a: PayloadAction<boolean>) => { s.loading = a.payload; },
        setError: (s, a: PayloadAction<string | null>) => { s.error = a.payload; },
        clearNotes: () => initial,
    },
});

export const { upsertNote, upsertMany, setLoading, setError, clearNotes } = slice.actions;
export const notesReducer = slice.reducer;