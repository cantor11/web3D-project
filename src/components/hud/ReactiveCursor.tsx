import { useEffect, useRef, useState } from 'react';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export type CursorVisualState = 'default' | 'hover' | 'active';

/**
 * Optical cursor reticle tracking pointer coordinates via compositor-only
 * transforms while preserving default, hover, and active interaction states.
 * Uses a 0x0 anchor at (clientX, clientY) so the reticle center is always
 * locked to the exact pointer coordinates regardless of label dimensions.
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

  const hoveredLabel = hoveredNodeId ? NODE_DETAILS[hoveredNodeId]?.actionLabel[locale] : null;

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
      className="pointer-events-none fixed top-0 left-0 z-40 h-0 w-0"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    >
      <div
        data-testid="reactive-cursor-ring"
        className={`absolute top-0 left-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-150 ${
          visualState === 'active'
            ? 'h-6 w-6 border-[var(--accent-primary)] bg-[var(--accent-soft)]'
            : visualState === 'hover'
              ? 'h-8 w-8 border-[var(--accent-primary)] bg-[var(--accent-soft)]'
              : 'h-3.5 w-3.5 border-[var(--border-control)] bg-transparent'
        }`}
      >
        <span
          className={`rounded-full transition-all duration-150 ${
            visualState === 'active'
              ? 'h-2 w-2 bg-[var(--accent-primary)]'
              : visualState === 'hover'
                ? 'h-1.5 w-1.5 bg-[var(--accent-primary)]'
                : 'h-1 w-1 bg-[var(--text-secondary)]'
          }`}
        />
      </div>

      {hoveredLabel && (
        <div className="absolute top-5 left-0 -translate-x-1/2 whitespace-nowrap rounded-[2px] border border-[var(--border-control)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-primary)] shadow-sm">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}
