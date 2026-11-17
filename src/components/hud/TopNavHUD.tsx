import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Globe, Moon, SlidersHorizontal, Sun } from 'lucide-react';
import { PROFILE, STATIONS, getStationById } from '@/data/portfolioData';
import { type QualityPreset, usePortfolioStore } from '@/stores/usePortfolioStore';

const QUALITY_OPTIONS: {
  id: QualityPreset;
  label: { es: string; en: string };
  short: { es: string; en: string };
  spec: { es: string; en: string };
}[] = [
  {
    id: 'performance',
    label: { es: 'Rendimiento', en: 'Performance' },
    short: { es: 'Rend.', en: 'Perf.' },
    spec: {
      es: 'DPR 1.0x · Sin sombras ni postprocesado · GPU integrada',
      en: 'DPR 1.0x · No shadows or postprocessing · Integrated GPU',
    },
  },
  {
    id: 'balanced',
    label: { es: 'Equilibrado', en: 'Balanced' },
    short: { es: 'Equil.', en: 'Bal.' },
    spec: {
      es: 'DPR 1.5x · Sombras 1024px · SMAA + Outline',
      en: 'DPR 1.5x · 1024px shadows · SMAA + Outline',
    },
  },
  {
    id: 'ultra',
    label: { es: 'Máximo', en: 'Maximum' },
    short: { es: 'Máx.', en: 'Max.' },
    spec: {
      es: 'DPR 2.0x · Sombras 2048px · Bloom + PBR completo',
      en: 'DPR 2.0x · 2048px shadows · Bloom + full PBR',
    },
  },
];

export function TopNavHUD() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [graphicsOpen, setGraphicsOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const graphicsToggleRef = useRef<HTMLButtonElement>(null);

  const targetSection = usePortfolioStore((s) => s.targetSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const locale = usePortfolioStore((s) => s.locale);
  const theme = usePortfolioStore((s) => s.theme);
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);
  const autoQuality = usePortfolioStore((s) => s.autoQuality);
  const renderStats = usePortfolioStore((s) => s.renderStats);
  const navigateTo = usePortfolioStore((s) => s.navigateTo);
  const toggleLocale = usePortfolioStore((s) => s.toggleLocale);
  const toggleTheme = usePortfolioStore((s) => s.toggleTheme);
  const setQualityPreset = usePortfolioStore((s) => s.setQualityPreset);
  const setAutoQuality = usePortfolioStore((s) => s.setAutoQuality);

  const activeStation = getStationById(targetSection);
  const currentQualityMeta =
    QUALITY_OPTIONS.find((q) => q.id === qualityPreset) ?? QUALITY_OPTIONS[1];

  useEffect(() => {
    if (!mobileMenuOpen && !graphicsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (graphicsOpen) {
          setGraphicsOpen(false);
          graphicsToggleRef.current?.focus();
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileToggleRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen, graphicsOpen]);

  return (
    <header
      data-transitioning={isTransitioning ? 'true' : 'false'}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto relative mx-auto max-w-7xl overflow-hidden rounded-[6px] studio-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 lg:flex-nowrap">
          {/* Brand */}
          <div className="order-1 shrink-0">
            <p className="whitespace-nowrap font-display text-base font-medium tracking-tight text-[var(--text-primary)] sm:text-lg">
              {PROFILE.shortName}
            </p>
            <p className="hidden whitespace-nowrap text-xs text-[var(--text-secondary)] sm:block">
              {PROFILE.role[locale]}
            </p>
          </div>

          {/* Mobile Drawer Trigger (<768px) */}
          <div className="order-3 w-full border-t border-[var(--border-subtle)] pt-1.5 md:hidden">
            <button
              ref={mobileToggleRef}
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setGraphicsOpen(false);
              }}
              aria-expanded={mobileMenuOpen}
              aria-controls="portfolio-station-nav"
              aria-label={
                locale === 'es'
                  ? 'Abrir navegación de secciones'
                  : 'Open sections navigation'
              }
              className="flex w-full items-center justify-between gap-2 rounded-[4px] px-1 py-1 text-left text-xs font-medium text-[var(--text-primary)]"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="font-mono text-[11px] text-[var(--accent-primary)]">
                  0{activeStation.index} / 05
                </span>
                <span className="truncate font-semibold">{activeStation.label[locale]}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[var(--text-secondary)]">
                <span>{locale === 'es' ? 'Secciones' : 'Sections'}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>

          {/* Single semantic navigation landmark adapted across mobile/tablet/desktop */}
          <nav
            id="portfolio-station-nav"
            aria-label={locale === 'es' ? 'Estaciones del portafolio' : 'Portfolio stations'}
            className={`${
              mobileMenuOpen ? 'block border-t border-[var(--border-subtle)] pt-2' : 'hidden'
            } order-4 w-full md:order-3 md:block md:border-t md:border-[var(--border-subtle)] md:pt-1.5 lg:order-2 lg:w-auto lg:border-t-0 lg:pt-0`}
          >
            <ul className="grid grid-cols-1 gap-1 md:flex md:items-center md:justify-between lg:justify-center lg:gap-1 xl:gap-2">
              {STATIONS.map((station) => {
                const isActive = targetSection === station.id;
                return (
                  <li key={station.id}>
                    <button
                      type="button"
                      onClick={() => {
                        navigateTo(station.id);
                        setMobileMenuOpen(false);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative flex w-full items-baseline justify-between gap-2 whitespace-nowrap rounded-[6px] px-3 py-2 text-xs transition-colors md:inline-flex md:w-auto md:justify-start md:rounded-[4px] md:px-2.5 md:py-1.5 ${
                        isActive
                          ? 'border border-[var(--accent-primary)] bg-[var(--accent-soft)] font-semibold text-[var(--text-primary)] md:border-transparent md:bg-transparent'
                          : 'border border-transparent font-normal text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="md:order-2">{station.label[locale]}</span>
                      <span
                        className={`font-mono text-[11px] md:order-1 ${
                          isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        0{station.index}
                      </span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="hidden md:block md:absolute md:inset-x-2.5 md:-bottom-[6px] lg:-bottom-[9px] md:h-[2px] md:bg-[var(--accent-primary)]"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Global Utilities */}
          <div className="order-2 flex shrink-0 items-center gap-1.5 sm:gap-2 lg:order-3">
            <button
              ref={graphicsToggleRef}
              type="button"
              onClick={() => {
                setGraphicsOpen((prev) => !prev);
                setMobileMenuOpen(false);
              }}
              aria-expanded={graphicsOpen}
              aria-controls="graphics-quality-panel"
              aria-label={
                locale === 'es'
                  ? `Configurar calidad gráfica (actual: ${currentQualityMeta.label.es})`
                  : `Configure graphics quality (current: ${currentQualityMeta.label.en})`
              }
              className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
                graphicsOpen
                  ? 'border border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                  : 'studio-control'
              }`}
            >
              <SlidersHorizontal
                className="h-3.5 w-3.5 text-[var(--accent-primary)]"
                aria-hidden="true"
              />
              <span className="hidden xl:inline">
                { currentQualityMeta.label[locale] }
              </span>
              <span className="hidden font-mono text-[11px] sm:inline xl:hidden">
                { currentQualityMeta.short[locale] }
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? locale === 'es'
                    ? 'Cambiar a tema claro'
                    : 'Switch to light theme'
                  : locale === 'es'
                    ? 'Cambiar a tema oscuro'
                    : 'Switch to dark theme'
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-medium transition-colors studio-control"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark'
                  ? locale === 'es'
                    ? 'Claro'
                    : 'Light'
                  : locale === 'es'
                    ? 'Oscuro'
                    : 'Dark'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleLocale}
              aria-label={locale === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'}
              className="inline-flex items-center justify-center gap-1.5 rounded-[6px] px-2.5 py-1.5 font-mono text-xs font-medium transition-colors studio-control"
            >
              <Globe className="h-3.5 w-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
              <span>{locale.toUpperCase()}</span>
            </button>

            <a
              href={PROFILE.cvPath}
              download="Junior_Cantor_CV.pdf"
              className="inline-flex items-center justify-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-semibold transition studio-cta"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{locale === 'es' ? 'Hoja de vida' : 'Resume PDF'}</span>
              <span className="sm:hidden">CV</span>
            </a>
          </div>
        </div>

        {/* Expandable Graphics Quality & Performance Diagnostic Tray */}
        {graphicsOpen && (
          <section
            id="graphics-quality-panel"
            aria-label={
              locale === 'es'
                ? 'Ajustes de rendimiento y calidad gráfica 3D'
                : '3D performance and graphics quality settings'
            }
            className="studio-content-swap border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3.5 py-3 sm:px-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {locale === 'es'
                      ? 'Perfil gráfico WebGL2'
                      : 'WebGL2 graphics profile'}
                  </p>
                  <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={autoQuality}
                      onChange={(e) => setAutoQuality(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[var(--accent-primary)]"
                    />
                    <span>
                      {locale === 'es'
                        ? 'Ajuste automático si bajan los FPS'
                        : 'Auto-step down on low FPS'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {currentQualityMeta.spec[locale]}
                </p>
              </div>

              <div
                role="group"
                aria-label={locale === 'es' ? 'Modos de calidad' : 'Quality modes'}
                className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center"
              >
                {QUALITY_OPTIONS.map((opt) => {
                  const active = qualityPreset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setQualityPreset(opt.id)}
                      className={`rounded-[6px] px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'font-semibold studio-cta'
                          : 'studio-control text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {opt.label[locale]}
                    </button>
                  );
                })}
              </div>

              <dl className="flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-2 font-mono text-[11px] tabular-nums lg:border-t-0 lg:pt-0">
                <div className="flex items-baseline gap-1">
                  <dt className="text-[var(--text-secondary)]">FPS</dt>
                  <dd className="font-semibold text-[var(--status-ok)]">{renderStats.fps}</dd>
                </div>
                <div className="flex items-baseline gap-1">
                  <dt className="text-[var(--text-secondary)]">Draw calls</dt>
                  <dd className="font-semibold text-[var(--text-primary)]">
                    {renderStats.calls}
                  </dd>
                </div>
                <div className="flex items-baseline gap-1">
                  <dt className="text-[var(--text-secondary)]">
                    {locale === 'es' ? 'Triángulos' : 'Triangles'}
                  </dt>
                  <dd className="font-semibold text-[var(--text-primary)]">
                    {renderStats.triangles}
                  </dd>
                </div>
                <div className="flex items-baseline gap-1">
                  <dt className="text-[var(--text-secondary)]">
                    {locale === 'es' ? 'Texturas' : 'Textures'}
                  </dt>
                  <dd className="font-semibold text-[var(--text-primary)]">
                    {renderStats.textures}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {isTransitioning && (
          <div
            aria-hidden="true"
            className="h-[2px] w-full bg-[var(--accent-primary)] transition-opacity duration-200"
          />
        )}
      </div>
    </header>
  );
}
