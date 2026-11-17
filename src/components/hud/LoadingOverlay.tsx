import { useProgress } from '@react-three/drei';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function LoadingOverlay() {
  const { active, progress } = useProgress();
  const isAssetReady = usePortfolioStore((s) => s.isAssetReady);
  const locale = usePortfolioStore((s) => s.locale);

  const isVisible = !isAssetReady || active;
  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16]/95 px-6 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="hud-panel w-full max-w-sm rounded-xl p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">
          {locale === 'es' ? 'INICIALIZANDO MOTOR WEBGL2' : 'INITIALIZING WEBGL2 ENGINE'}
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-100">Junior Cantor · Web 3D</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-200"
            style={{ width: `${Math.max(12, Math.min(100, Math.round(progress)))}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[11px] text-slate-400">
          {Math.round(progress)}% · DRACO + PBR Shaders
        </p>
      </div>
    </div>
  );
}
