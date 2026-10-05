import { configureStore } from '@reduxjs/toolkit';
import {
  sessionReducer,
  loginDemo,
  logoutThunk,
  setUnauthorized,
} from '../../src/presentation/session/sessionSlice';

jest.mock('../../src/data/repositories/SessionRepository', () => ({
  sessionRepository: {
    login: jest.fn(async (role: 'coordinator' | 'participant') => ({
      user: { id: role === 'coordinator' ? 'u-c' : 'u-p', name: role, role },
      token: `demo-${role}`,
    })),
    restore: jest.fn(async () => null),
    logout: jest.fn(async () => {}),
  },
}));

const makeStore = () =>
  configureStore({ reducer: { session: sessionReducer } });

describe('sessionSlice', () => {
  it('loginDemo deja user y token', async () => {
    const store = makeStore();
    await store.dispatch(loginDemo('coordinator'));
    const s = store.getState().session;
    expect(s.user?.role).toBe('coordinator');
    expect(s.token).toBe('demo-coordinator');
    expect(s.error).toBeNull();
  });

  it('setUnauthorized limpia la sesión', () => {
    const store = makeStore();
    store.dispatch(setUnauthorized());
    const s = store.getState().session;
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(s.error).toBe('Sesión expirada');
  });

  it('logoutThunk limpia user y token', async () => {
    const store = makeStore();
    await store.dispatch(loginDemo('participant'));
    await store.dispatch(logoutThunk());
    const s = store.getState().session;
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
  });
});