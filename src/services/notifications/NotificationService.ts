import notifee, {
    AndroidImportance,
    AuthorizationStatus,
    EventType,
    TimestampTrigger,
    TriggerType,
  } from '@notifee/react-native';
  import { Platform } from 'react-native';
  import { logger } from '../../core/logger';
  
  const CHANNEL_ID = 'signal-priority';
  
  export interface PriorityPayload {
    channelId: string;
    noteId: string;
    title: string;
    body: string;
  }
  
  export const notificationService = {
    async requestPermission(): Promise<boolean> {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    },
  
    async ensureChannel(): Promise<string> {
      if (Platform.OS === 'android') {
        return notifee.createChannel({
          id: CHANNEL_ID,
          name: 'Priority',
          importance: AndroidImportance.HIGH,
        });
      }
      return CHANNEL_ID;
    },
  
    /**
     * Fake de APNs: simula una notificación Priority que llega del back.
     * En producción, esto vendría de un push real con la misma estructura.
     */
    async presentPriority(payload: PriorityPayload): Promise<void> {
      const channelId = await this.ensureChannel();
  
      await notifee.displayNotification({
        id: payload.noteId,                     // dedupe por noteId
        title: payload.title,
        body: payload.body,
        data: {
          type: 'priority',
          channelId: payload.channelId,
          noteId: payload.noteId,
          deepLink: `signal://note/${payload.channelId}/${payload.noteId}`,
        },
        ios: {
          sound: 'default',
          interruptionLevel: 'timeSensitive',    // iOS 15+
          foregroundPresentationOptions: {
            banner: true,
            sound: true,
            badge: false,
          },
          categoryId: 'priority',
        },
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      });
    },
  
    /**
     * Cancela una notificación activa (cross-device cancel).
     */
    async cancel(noteId: string): Promise<void> {
      await notifee.cancelNotification(noteId);
    },
  
    /**
     * Programa una notificación futura (para demo controlada).
     */
    async schedulePriority(payload: PriorityPayload, delayMs: number): Promise<void> {
      const channelId = await this.ensureChannel();
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + delayMs,
      };
      await notifee.createTriggerNotification(
        {
          id: payload.noteId,
          title: payload.title,
          body: payload.body,
          data: {
            type: 'priority',
            channelId: payload.channelId,
            noteId: payload.noteId,
            deepLink: `signal://note/${payload.channelId}/${payload.noteId}`,
          },
          ios: { sound: 'default', interruptionLevel: 'timeSensitive' },
          android: { channelId, importance: AndroidImportance.HIGH },
        },
        trigger,
      );
    },
  };