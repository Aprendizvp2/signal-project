import * as Keychain from 'react-native-keychain';
import { logger } from '../../core/logger';

const SERVICE = 'com.signal.session';

export interface StoredSession { token: string; userId: string; role: string; }

export const secureStorage = {
  async save(session: StoredSession): Promise<void> {
    try {
      await Keychain.setGenericPassword(session.userId, JSON.stringify(session), {
        service: SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (e) {
      logger.error('[secureStorage] save failed', e);
      throw e;
    }
  },

  async load(): Promise<StoredSession | null> {
    try {
      const creds = await Keychain.getGenericPassword({ service: SERVICE });
      if (!creds) return null;
      return JSON.parse(creds.password) as StoredSession;
    } catch (e) {
      logger.warn('[secureStorage] load failed', e);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE });
    } catch (e) {
      logger.warn('[secureStorage] clear failed', e);
    }
  },
};