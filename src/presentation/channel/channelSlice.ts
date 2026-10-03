import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Channel } from '../../domain/models';
import { channelRepository } from '../../data/repositories/ChannelRepository';

interface State {
  current: Channel | null;
  loading: boolean;
  error: string | null;
}
const initial: State = { current: null, loading: false, error: null };

export const loadChannel = createAsyncThunk(
  'channel/load',
  async (channelId: string) => channelRepository.get(channelId),
);

const slice = createSlice({
  name: 'channel',
  initialState: initial,
  reducers: { clearChannel: () => initial },
  extraReducers: b => {
    b.addCase(loadChannel.pending, s => { s.loading = true; s.error = null; });
    b.addCase(loadChannel.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; });
    b.addCase(loadChannel.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? 'Error al cargar canal';
    });
  },
});

export const { clearChannel } = slice.actions;
export const channelReducer = slice.reducer;