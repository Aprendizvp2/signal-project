import { fakeApi } from '../fake/handlers';
import { secureStorage, StoredSession } from '../storage/secureStorage';
import type { User } from '../../domain/models';

export interface SessionRepository {
    login(role: 'coordinator' | 'participant'): Promise<{ user: User; token: string }>;
    restore(): Promise<{ user: User; token: string } | null>;
    logout(): Promise<void>;
}

export const sessionRepository: SessionRepository = {
    async login(role) {
        const dto = await fakeApi.login(role);
        const user: User = { id: dto.user.id, name: dto.user.name, role: dto.user.role };
        const stored: StoredSession = { token: dto.token, userId: user.id, role: user.role };
        await secureStorage.save(stored);
        return { user, token: dto.token };
    },

    async restore() {
        const stored = await secureStorage.load();
        if (!stored) return null;
        try {
            const dto = await fakeApi.getMe(stored.token);
            const user: User = { id: dto.id, name: dto.name, role: dto.role };
            return { user, token: stored.token };
        } catch {
            await secureStorage.clear();
            return null;
        }
    },

    async logout() {
        await secureStorage.clear();
    },
};