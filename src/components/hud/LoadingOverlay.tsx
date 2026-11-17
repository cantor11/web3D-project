import { useProgress } from '@react-three/drei';
import { PROFILE } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function LoadingOverlay() {
  const { active, progress } = useProgress();
  const isAssetReady = usePortfolioStore((s) => s.isAssetReady);
  const locale = usePortfolioStore((s) => s.locale);

  const isVisible = !isAssetReady || active;
  if (!isVisible) return null;

  const roundedProgress = Math.max(8, Math.min(100, Math.round(progress)));

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-stage)] px-6 transition-opacity duration-300"
    >
      <div className="studio-surface w-full max-w-sm rounded-[8px] p-6">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {locale === 'es' ? 'Preparando escena interactiva' : 'Loading interactive workspace'}
        </p>
        <p className="mt-1 font-display text-2xl font-medium text-[var(--text-primary)]">
          {PROFILE.shortName}
        </p>
        <div className="mt-4 h-1 w-full overflow-hidden bg-[var(--bg-muted)]">
          <div
            className="h-full bg-[var(--accent-primary)] transition-[width] duration-200"
            style={{ width: `${roundedProgress}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--text-secondary)]">
          {roundedProgress}%
        </p>
      </div>
    </div>
  );
}
