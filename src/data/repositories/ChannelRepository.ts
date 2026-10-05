import { fakeApi } from '../fake/handlers';
import type { Channel, User } from '../../domain/models';

export interface ChannelRepository {
  get(channelId: string): Promise<Channel>;
}

const mapUser = (dto: { id: string; name: string; role: 'coordinator' | 'participant' }): User => ({
  id: dto.id, name: dto.name, role: dto.role,
});

export const channelRepository: ChannelRepository = {
  async get(channelId) {
    const dto = await fakeApi.getChannel(channelId);
    return {
      id: dto.id,
      name: dto.name,
      participants: dto.participants.map(mapUser),
    };
  },
};