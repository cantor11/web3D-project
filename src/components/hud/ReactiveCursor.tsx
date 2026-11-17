import { useEffect, useRef, useState } from 'react';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export type CursorVisualState = 'default' | 'hover' | 'active';

/**
 * SUB-11 (PW3D-10): Reactive HUD cursor component with explicit default, hover,
 * and active click states. Position updates mutate transform via ref on the
 * compositor thread without triggering React re-renders on pointermove.
 */
export function ReactiveCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(true);

  const hoveredNodeId = usePortfolioStore((s) => s.hoveredNodeId);
  const locale = usePortfolioStore((s) => s.locale);

  const visualState: CursorVisualState = isPressed
    ? 'active'
    : hoveredNodeId
      ? 'hover'
      : 'default';

  const hoveredLabel = hoveredNodeId ? NODE_DETAILS[hoveredNodeId]?.organization[locale] : null;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    const onPointerMove = (e: PointerEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const onPointerDown = () => setIsPressed(true);
    const onPointerUp = () => setIsPressed(false);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <div
      ref={cursorRef}
      data-testid="reactive-cursor"
      data-cursor-state={visualState}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-40 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    >
      <div
        className={`flex items-center justify-center rounded-full border transition-all duration-150 ${
          visualState === 'active'
            ? 'h-6 w-6 scale-90 border-emerald-400 bg-emerald-400/25 shadow-[0_0_16px_rgba(16,185,129,0.6)]'
            : visualState === 'hover'
              ? 'h-9 w-9 scale-105 border-cyan-300 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.55)]'
              : 'h-4 w-4 border-cyan-400/45 bg-transparent'
        }`}
      >
        <span
          className={`rounded-full transition-all duration-150 ${
            visualState === 'active'
              ? 'h-2 w-2 bg-emerald-300'
              : visualState === 'hover'
                ? 'h-1.5 w-1.5 bg-cyan-200'
                : 'h-1 w-1 bg-cyan-400/60'
          }`}
        />
      </div>

      {hoveredLabel && (
        <div className="mt-1.5 -translate-x-1/4 whitespace-nowrap rounded border border-cyan-400/50 bg-slate-950/90 px-2 py-0.5 font-mono text-[10px] text-cyan-200 shadow-md">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}
