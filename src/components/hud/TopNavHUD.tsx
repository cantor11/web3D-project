import { Download, Languages } from 'lucide-react';
import { PROFILE, STATIONS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function TopNavHUD() {
  const targetSection = usePortfolioStore((s) => s.targetSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const locale = usePortfolioStore((s) => s.locale);
  const navigateTo = usePortfolioStore((s) => s.navigateTo);
  const toggleLocale = usePortfolioStore((s) => s.toggleLocale);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col gap-2 px-3 pt-3 sm:px-5 sm:pt-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 hud-panel">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-400/10 font-mono text-xs font-bold text-cyan-300">
            JC
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold tracking-wide text-slate-100 sm:text-sm">
              {PROFILE.shortName}
            </p>
            <p className="font-mono text-[10px] text-cyan-300/80">
              {locale === 'es' ? 'Ing. Sistemas · Data & Web 3D' : 'Systems Eng · Data & Web 3D'}
            </p>
          </div>
        </div>

        <nav
          aria-label={locale === 'es' ? 'Estaciones 3D' : '3D Stations'}
          className="order-3 w-full overflow-x-auto lg:order-2 lg:w-auto"
        >
          <ul className="flex flex-nowrap items-center justify-start gap-1 sm:flex-wrap sm:justify-center">
            {STATIONS.map((station) => {
              const isActive = targetSection === station.id;
              return (
                <li key={station.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateTo(station.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 font-mono text-[10px] transition-colors sm:px-2.5 sm:py-1.5 sm:text-xs ${
                      isActive
                        ? 'border border-cyan-400/65 bg-cyan-400/18 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.2)]'
                        : 'border border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-slate-800/70 hover:text-cyan-200'
                    }`}
                  >
                    <span className="text-[10px] text-cyan-400/80">[{station.index}]</span>
                    <span>{station.label[locale]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="order-2 flex items-center gap-1.5 lg:order-3">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={locale === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[11px] text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
          >
            <Languages className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>{locale.toUpperCase()}</span>
          </button>

          <a
            href={PROFILE.cvPath}
            download="Junior_Cantor_CV.pdf"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-3 py-1.5 font-mono text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/25"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span>{locale === 'es' ? 'CV PDF' : 'Resume PDF'}</span>
          </a>
        </div>
      </div>

      {isTransitioning && (
        <div className="pointer-events-none mx-auto flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-950/80 px-3 py-1 font-mono text-[10px] tracking-wider text-cyan-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span>
            {locale === 'es'
              ? 'CÁMARA EN TRANSICIÓN · GSAP power3.inOut'
              : 'CAMERA IN TRANSIT · GSAP power3.inOut'}
          </span>
        </div>
      )}
    </header>
  );
}
