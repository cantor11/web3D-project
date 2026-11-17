import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Globe, Moon, Sun } from 'lucide-react';
import { PROFILE, STATIONS, getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function TopNavHUD() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const targetSection = usePortfolioStore((s) => s.targetSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const locale = usePortfolioStore((s) => s.locale);
  const theme = usePortfolioStore((s) => s.theme);
  const navigateTo = usePortfolioStore((s) => s.navigateTo);
  const toggleLocale = usePortfolioStore((s) => s.toggleLocale);
  const toggleTheme = usePortfolioStore((s) => s.toggleTheme);

  const activeStation = getStationById(targetSection);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

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
              onClick={() => setMobileMenuOpen((prev) => !prev)}
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
