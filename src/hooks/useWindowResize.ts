import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { RootState } from '@react-three/fiber';

/**
 * Synchronizes R3F viewport size, clamped DPR [1, 2], and camera projection
 * matrix within a single animation frame (<= 16ms) with debouncing on resize
 * and mobile orientation changes.
 */
export function useWindowResize(state: RootState | null, debounceMs = 12): void {
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state) return;

    const applyResize = () => {
      const width = window.innerWidth;
      const height = Math.max(window.innerHeight, 1);
      const clampedDpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);

      state.setDpr(clampedDpr);
      state.setSize(width, height);

      if (state.camera instanceof THREE.PerspectiveCamera) {
        state.camera.aspect = width / height;
        state.camera.updateProjectionMatrix();
      }
      state.invalidate();
    };

    const handleResize = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = window.requestAnimationFrame(applyResize);
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [state, debounceMs]);
}
