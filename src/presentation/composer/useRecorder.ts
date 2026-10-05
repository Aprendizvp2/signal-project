import { useCallback, useEffect, useRef, useState } from 'react';
import { audioService, RecordedAudio } from '../../services/audio/AudioService';
import { AppError } from '../../core/errors';

type RecorderState = 'idle' | 'recording' | 'recorded' | 'error';

export const useRecorder = () => {
    const [state, setState] = useState<RecorderState>('idle');
    const [audio, setAudio] = useState<RecordedAudio | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const elapsedRef = useRef(0);

    useEffect(() => () => {
        if (timer.current) clearInterval(timer.current);
        audioService.stopPlay().catch(() => { });
    }, []);

    const start = useCallback(async () => {
        try {
            setError(null);
            await audioService.start();
            setState('recording');
            setElapsed(0);
            elapsedRef.current = 0;
            timer.current = setInterval(() => {
                elapsedRef.current += 100;
                setElapsed(elapsedRef.current);
            }, 100);
        } catch (e) {
            setError((e as AppError)?.message ?? 'Error al grabar');
            setState('error');
        }
    }, []);

    const stop = useCallback(async () => {
        try {
            if (timer.current) clearInterval(timer.current);
            const rec = await audioService.stop(elapsedRef.current);
            setAudio(rec);
            setState('recorded');
        } catch (e) {
            setError((e as AppError)?.message ?? 'Error al detener');
            setState('error');
        }
    }, []);

    const cancel = useCallback(async () => {
        if (timer.current) clearInterval(timer.current);
        await audioService.cancel();
        setAudio(null);
        setElapsed(0);
        elapsedRef.current = 0;
        setState('idle');
    }, []);

    const reset = useCallback(() => {
        setAudio(null);
        setElapsed(0);
        elapsedRef.current = 0;
        setError(null);
        setState('idle');
    }, []);

    return { state, audio, error, elapsed, start, stop, cancel, reset };
};