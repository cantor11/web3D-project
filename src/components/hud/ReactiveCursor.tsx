import { useEffect, useRef, useState } from 'react';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export type CursorVisualState = 'default' | 'hover' | 'active';

/**
 * Optical cursor reticle tracking pointer coordinates via compositor-only
 * transforms while preserving default, hover, and active interaction states.
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
      className="pointer-events-none fixed top-0 left-0 z-40 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    >
      <div
        className={`flex items-center justify-center rounded-full border transition-all duration-150 ${
          visualState === 'active'
            ? 'h-6 w-6 scale-90 border-[var(--accent-primary)] bg-[var(--accent-soft)]'
            : visualState === 'hover'
              ? 'h-8 w-8 scale-105 border-[var(--accent-primary)] bg-[var(--accent-soft)]'
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
        <div className="mt-1.5 -translate-x-1/4 whitespace-nowrap rounded-[2px] border border-[var(--border-control)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-primary)]">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
}
