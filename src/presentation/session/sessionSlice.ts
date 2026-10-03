import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../domain/models';
import { sessionRepository } from '../../data/repositories/SessionRepository';

interface State {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
const initial: State = { user: null, token: null, loading: false, error: null };

export const loginDemo = createAsyncThunk(
    'session/loginDemo',
    async (role: 'coordinator' | 'participant') => sessionRepository.login(role),
);

const slice = createSlice({
    name: 'session',
    initialState: initial,
    reducers: {
        logout: () => initial,
        setUnauthorized: s => { s.user = null; s.token = null; s.error = 'Sesión expirada'; },
    },
    extraReducers: b => {
        b.addCase(loginDemo.pending, s => { s.loading = true; s.error = null; });
        b.addCase(loginDemo.fulfilled, (s, a: PayloadAction<{ user: User; token: string }>) => {
            s.loading = false; s.user = a.payload.user; s.token = a.payload.token;
        });
        b.addCase(loginDemo.rejected, (s, a) => {
            s.loading = false; s.error = a.error.message ?? 'Error';
        });
    },
});

export const { logout, setUnauthorized } = slice.actions;
export const sessionReducer = slice.reducer;