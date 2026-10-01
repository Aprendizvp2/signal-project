import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Channel } from '../../domain/models';

interface State {
    current: Channel | null;
    loading: boolean;
    error: string | null;
}

const initial: State = { current: null, loading: false, error: null };

const slice = createSlice({
    name: 'channel',
    initialState: initial,
    reducers: {
        setChannel: (s, a: PayloadAction<Channel | null>) => { s.current = a.payload; },
        setLoading: (s, a: PayloadAction<boolean>) => { s.loading = a.payload; },
        setError: (s, a: PayloadAction<string | null>) => { s.error = a.payload; },
        clearChannel: () => initial,
    },
});

export const { setChannel, setLoading, setError, clearChannel } = slice.actions;
export const channelReducer = slice.reducer;