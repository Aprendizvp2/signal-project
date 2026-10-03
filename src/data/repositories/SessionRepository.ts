import { fakeApi } from '../fake/handlers';
import type { User } from '../../domain/models';

export interface SessionRepository {
    login(role: 'coordinator' | 'participant'): Promise<{ user: User; token: string }>;
}

export const sessionRepository: SessionRepository = {
    async login(role) {
        const dto = await fakeApi.login(role);
        // map DTO -> dominio
        const user: User = { id: dto.user.id, name: dto.user.name, role: dto.user.role };
        return { user, token: dto.token };
    },
};