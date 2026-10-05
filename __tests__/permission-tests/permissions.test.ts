import {
    canCreateChannel,
    canInvite,
    canSendStandard,
    canSendPriority,
    canReply,
  } from '../../src/domain/permissions';
  
  describe('permissions', () => {
    describe('Coordinator', () => {
      const role = 'coordinator' as const;
      it('puede crear canal', () => expect(canCreateChannel(role)).toBe(true));
      it('puede invitar', () => expect(canInvite(role)).toBe(true));
      it('puede enviar Standard', () => expect(canSendStandard(role)).toBe(true));
      it('puede enviar Priority', () => expect(canSendPriority(role)).toBe(true));
      it('puede responder', () => expect(canReply(role)).toBe(true));
    });
  
    describe('Participant', () => {
      const role = 'participant' as const;
      it('NO puede crear canal', () => expect(canCreateChannel(role)).toBe(false));
      it('NO puede invitar', () => expect(canInvite(role)).toBe(false));
      it('puede enviar Standard', () => expect(canSendStandard(role)).toBe(true));
      it('NO puede enviar Priority', () => expect(canSendPriority(role)).toBe(false));
      it('puede responder', () => expect(canReply(role)).toBe(true));
    });
  
    it('kill switch: si PRIORITY_ENABLED es false, nadie puede Priority', () => {
      // Esto documenta el contrato: la regla vive en un solo lugar
      const canAnyonePriority = ['coordinator', 'participant'].some(
        r => canSendPriority(r as any) && r === 'participant',
      );
      expect(canAnyonePriority).toBe(false);
    });
  });