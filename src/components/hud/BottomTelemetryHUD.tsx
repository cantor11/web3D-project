import { ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { getStationById, NODE_DETAILS, type InteractiveNodeId } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function BottomTelemetryHUD() {
  const currentSection = usePortfolioStore((s) => s.currentSection);
  const targetSection = usePortfolioStore((s) => s.targetSection);
  const hoveredNodeId = usePortfolioStore((s) => s.hoveredNodeId);
  const locale = usePortfolioStore((s) => s.locale);
  const dracoInitMs = usePortfolioStore((s) => s.dracoInitMs);
  const raycastTimeMs = usePortfolioStore((s) => s.raycastTimeMs);
  const stepStation = usePortfolioStore((s) => s.stepStation);
  const selectNode = usePortfolioStore((s) => s.selectNode);

  const station = getStationById(targetSection || currentSection);
  const hoveredDetail = hoveredNodeId ? NODE_DETAILS[hoveredNodeId] : null;

  const stationNodes = (Object.keys(NODE_DETAILS) as InteractiveNodeId[])
    .map((id) => NODE_DETAILS[id])
    .filter((d) => d.stationId === station.id);

  return (
    <footer
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-5 sm:pb-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 hud-panel">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => stepStation(-1)}
            aria-label={locale === 'es' ? 'Estación anterior' : 'Previous station'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold text-cyan-200">
              {station.shortLabel[locale]}
            </p>
            <p className="truncate text-[11px] text-slate-400">{station.subtitle[locale]}</p>
          </div>

          <button
            type="button"
            onClick={() => stepStation(1)}
            aria-label={locale === 'es' ? 'Siguiente estación' : 'Next station'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/70 text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {stationNodes.map((node) => {
            const isNodeHovered = hoveredNodeId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => selectNode(node.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                  isNodeHovered
                    ? 'border-cyan-400/75 bg-cyan-400/20 text-cyan-100'
                    : 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/20'
                }`}
              >
                <MousePointerClick className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span>{node.organization[locale].split('·')[0].trim()}</span>
              </button>
            );
          })}

          {hoveredDetail && (
            <span className="hidden font-mono text-[10px] text-cyan-300 lg:inline">
              [{hoveredDetail.title[locale]}]
            </span>
          )}

          <div className="hidden items-center gap-2 border-l border-slate-700/80 pl-2.5 font-mono text-[10px] text-slate-400 md:flex">
            <span>Orbit: 15°–85°</span>
            <span>·</span>
            <span>Keys: 1–5 / ← →</span>
            {dracoInitMs !== null && (
              <>
                <span>·</span>
                <span className="text-cyan-300/90">DRACO: {dracoInitMs}ms</span>
              </>
            )}
            {raycastTimeMs > 0 && (
              <>
                <span>·</span>
                <span className="text-emerald-300/90">Ray: {raycastTimeMs}ms</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
