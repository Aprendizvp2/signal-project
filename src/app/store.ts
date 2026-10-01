import { configureStore } from '@reduxjs/toolkit';
import { sessionReducer } from '../presentation/session/sessionSlice';
import { channelReducer } from '../presentation/channel/channelSlice';
import { notesReducer } from '../presentation/notes/notesSlice';

export const store = configureStore({
    reducer: {
        session: sessionReducer,
        channel: channelReducer,
        notes: notesReducer,
    },
    middleware: gdm => gdm({ serializableCheck: false, immutableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;