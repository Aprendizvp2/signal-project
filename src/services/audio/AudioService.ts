import {
    AudioContext,
    AudioManager,
    AudioRecorder,
    AudioBuffer,
    AudioBufferSourceNode,
  } from 'react-native-audio-api';
  import { Platform, PermissionsAndroid } from 'react-native';
  import { AppError } from '../../core/errors';
  import { logger } from '../../core/logger';
  
  export const AUDIO_LIMITS = {
    MAX_DURATION_MS: 60_000,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
  };
  
  export interface RecordedAudio {
    uri: string;
    durationMs: number;
  }
  
  const recorder = new AudioRecorder();
  let ctx: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let currentPlayerUri: string | null = null;
  let currentFileName: string | null = null;
  let startedAt = 0;
  
  const getContext = () => {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  };
  
  export const audioService = {
    async requestPermission(): Promise<boolean> {
      try {
        if (Platform.OS === 'android') {
          const r = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          );
          if (r !== PermissionsAndroid.RESULTS.GRANTED) return false;
        }
        const granted = await AudioManager.requestRecordingPermissions();
        return String(granted).toLowerCase() === 'granted';
      } catch (e) {
        logger.warn('[audio] permiso', e);
        return false;
      }
    },
  
    async start(): Promise<void> {
      const ok = await this.requestPermission();
      if (!ok) throw new AppError('forbidden', 'Permiso de micrófono denegado');
      try {
        AudioManager.setAudioSessionOptions({
          iosCategory: 'playAndRecord',
          iosMode: 'default',
          iosOptions: ['defaultToSpeaker', 'allowBluetoothHFP'],
        });
  
        currentFileName = `signal-${Date.now()}.m4a`;
  
        // ⚠️ Ajustar según AudioRecorderFileOptions de tu versión
        recorder.enableFileOutput({
          fileName: currentFileName,
        } as any);
  
        recorder.start();
        startedAt = Date.now();
      } catch (e: any) {
        logger.error('[audio] start failed', { msg: e?.message, raw: e });
        throw new AppError('unknown', e?.message ?? 'No se pudo iniciar grabación');
      }
    },
  
    async stop(_durationMs: number): Promise<RecordedAudio> {
      try {
        const durationMs = Date.now() - startedAt;
        recorder.stop();
  
        if (durationMs > AUDIO_LIMITS.MAX_DURATION_MS) {
          throw new AppError('validation', 'Audio excede 60 segundos');
        }
  
        // Reconstruir la URI del archivo grabado.
        // audio-api guarda en el documents directory por defecto.
        const uri = `file://${currentFileName}`;
  
        return { uri, durationMs };
      } catch (e) {
        if (e instanceof AppError) throw e;
        logger.error('[audio] stop failed', e);
        throw new AppError('unknown', 'Error al detener grabación');
      }
    },
  
    async cancel(): Promise<void> {
      try {
        recorder.stop();
      } catch {}
    },
  
    async play(uri: string, onFinish?: () => void): Promise<void> {
      if (currentPlayerUri && currentPlayerUri !== uri) {
        await this.stopPlay();
      }
      currentPlayerUri = uri;
  
      try {
        const context = getContext();
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer: AudioBuffer = await context.decodeAudioData(arrayBuffer);
  
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.onEnded = () => {
          currentSource = null;
          currentPlayerUri = null;
          onFinish?.();
        };
        source.start(0);
        currentSource = source;
      } catch (e: any) {
        logger.error('[audio] play failed', { msg: e?.message, raw: e });
        currentPlayerUri = null;
        throw new AppError('unknown', e?.message ?? 'No se pudo reproducir');
      }
    },
  
    async pause(): Promise<void> {
      logger.info('[audio] pause no soportado con audio-api, usar stop');
    },
  
    async resume(): Promise<void> {
      logger.info('[audio] resume no soportado con audio-api');
    },
  
    async stopPlay(): Promise<void> {
      try {
        if (currentSource) {
          currentSource.stop();
          currentSource.disconnect();
        }
      } catch {}
      currentSource = null;
      currentPlayerUri = null;
    },
  };