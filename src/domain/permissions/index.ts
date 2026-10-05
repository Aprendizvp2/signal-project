import type { Role } from '../models';

export const canCreateChannel = (r: Role) => r === 'coordinator';
export const canInvite = (r: Role) => r === 'coordinator';
export const canSendStandard = (_: Role) => true;
export const canSendPriority = (r: Role) => r === 'coordinator';
export const canReply = (_: Role) => true;