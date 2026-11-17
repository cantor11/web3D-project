import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getStationById,
  NODE_DETAILS,
  type InteractiveNodeId,
} from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function BottomTelemetryHUD() {
  const currentSection = usePortfolioStore((s) => s.currentSection);
  const targetSection = usePortfolioStore((s) => s.targetSection);
  const hoveredNodeId = usePortfolioStore((s) => s.hoveredNodeId);
  const locale = usePortfolioStore((s) => s.locale);
  const stepStation = usePortfolioStore((s) => s.stepStation);
  const selectNode = usePortfolioStore((s) => s.selectNode);

  const station = getStationById(targetSection || currentSection);

  const stationNodes = (Object.keys(NODE_DETAILS) as InteractiveNodeId[])
    .map((id) => NODE_DETAILS[id])
    .filter((d) => d.stationId === station.id);

  return (
    <footer
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-5 sm:pb-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto mx-auto flex max-w-7xl flex-col gap-2.5 rounded-[6px] px-3.5 py-2.5 studio-surface sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => stepStation(-1)}
              aria-label={locale === 'es' ? 'Estación anterior' : 'Previous station'}
              className="inline-flex items-center justify-center rounded-[6px] px-2.5 py-1.5 transition-colors studio-control"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => stepStation(1)}
              aria-label={locale === 'es' ? 'Siguiente estación' : 'Next station'}
              className="inline-flex items-center justify-center rounded-[6px] px-2.5 py-1.5 transition-colors studio-control"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              <span className="mr-2 font-mono text-xs text-[var(--accent-primary)]">
                0{station.index} / 05
              </span>
              <span>{station.shortLabel[locale]}</span>
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {station.subtitle[locale]}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {stationNodes.map((node, index) => {
            const isNodeHovered = hoveredNodeId === node.id;
            const isPrimaryAction = index === 0;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => selectNode(node.id)}
                className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-medium transition ${
                  isNodeHovered
                    ? 'border border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                    : isPrimaryAction
                      ? 'font-semibold studio-cta'
                      : 'studio-control'
                }`}
              >
                <span>{node.actionLabel[locale]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
