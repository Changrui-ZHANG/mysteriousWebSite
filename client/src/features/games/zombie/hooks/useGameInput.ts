import { useEffect, useRef } from 'react';
import { GHOST_CLICK_DELAY } from '../constants';

export type InputSource = 'keyboard' | 'mouse' | 'touch';

export function useGameInput() {
    // Controls ref to store key states
    const keys = useRef<{ [key: string]: boolean }>({});
    const lastInputSource = useRef<InputSource>('keyboard');
    const isPointerDown = useRef(false);
    const ignoreMouseUntil = useRef(0);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            lastInputSource.current = 'keyboard';
        };
        const onKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;

        // Touch Handlers
        const onTouchStart = () => {
            isPointerDown.current = true;
            lastInputSource.current = 'touch';
            ignoreMouseUntil.current = Date.now() + GHOST_CLICK_DELAY;
        };
        const onTouchEnd = () => {
            isPointerDown.current = false;
            ignoreMouseUntil.current = Date.now() + GHOST_CLICK_DELAY;
        };
        const onTouchMove = () => {
            lastInputSource.current = 'touch';
            ignoreMouseUntil.current = Date.now() + GHOST_CLICK_DELAY;
        };

        // Mouse Handlers
        const onMouseDown = () => {
            if (Date.now() < ignoreMouseUntil.current) return;
            isPointerDown.current = true;
            lastInputSource.current = 'mouse';
        };
        const onMouseUp = () => {
            if (Date.now() < ignoreMouseUntil.current) return;
            isPointerDown.current = false;
        };
        const onMouseMove = () => {
            if (Date.now() < ignoreMouseUntil.current) return;
            lastInputSource.current = 'mouse';
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);

        window.addEventListener('touchstart', onTouchStart);
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchmove', onTouchMove);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return { keys, lastInputSource, isPointerDown };
}
