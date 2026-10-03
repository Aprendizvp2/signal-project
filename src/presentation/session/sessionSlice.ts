import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../domain/models';
import { sessionRepository } from '../../data/repositories/SessionRepository';

interface State {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrating: boolean;
  error: string | null;
}
const initial: State = { user: null, token: null, loading: false, hydrating: true, error: null };

export const loginDemo = createAsyncThunk(
  'session/loginDemo',
  async (role: 'coordinator' | 'participant') => sessionRepository.login(role),
);

export const restoreSession = createAsyncThunk(
  'session/restore',
  async () => sessionRepository.restore(),
);

export const logoutThunk = createAsyncThunk('session/logout', async () => {
  await sessionRepository.logout();
});

const slice = createSlice({
  name: 'session',
  initialState: initial,
  reducers: {
    setUnauthorized: s => { s.user = null; s.token = null; s.error = 'Sesión expirada'; },
  },
  extraReducers: b => {
    b.addCase(loginDemo.pending, s => { s.loading = true; s.error = null; });
    b.addCase(loginDemo.fulfilled, (s, a) => {
      s.loading = false; s.user = a.payload.user; s.token = a.payload.token;
    });
    b.addCase(loginDemo.rejected, (s, a) => {
      s.loading = false; s.error = a.error.message ?? 'Error';
    });

    b.addCase(restoreSession.fulfilled, (s, a) => {
      s.hydrating = false;
      if (a.payload) { s.user = a.payload.user; s.token = a.payload.token; }
    });
    b.addCase(restoreSession.rejected, s => { s.hydrating = false; });

    b.addCase(logoutThunk.fulfilled, s => {
      s.user = null; s.token = null; s.error = null;
    });
  },
});

export const { setUnauthorized } = slice.actions;
export const sessionReducer = slice.reducer;