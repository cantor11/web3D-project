import { useEffect, useRef } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

function isPointerOutside(event: PointerEvent, dialog: HTMLDialogElement): boolean {
  const rect = dialog.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

export function DetailDialog25D() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  const selectedNodeId = usePortfolioStore((s) => s.selectedNodeId);
  const locale = usePortfolioStore((s) => s.locale);
  const closeModal = usePortfolioStore((s) => s.closeModal);

  const detail = selectedNodeId ? NODE_DETAILS[selectedNodeId] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (detail && !dialog.open) {
      dialog.showModal();
    } else if (!detail && dialog.open) {
      dialog.close();
    }
  }, [detail]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => {
      dialog.returnValue = '';
      closeModal();
    };

    const onPointerDown = (e: PointerEvent) => {
      pressedOutsideRef.current = isPointerOutside(e, dialog);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutsideRef.current && isPointerOutside(e, dialog)) {
        dialog.close();
      }
      pressedOutsideRef.current = false;
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [closeModal]);

  return (
    <dialog
      ref={dialogRef}
      className="hud-dialog"
      aria-labelledby="detail-dialog-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {detail && (
        <article className="flex max-h-[85dvh] flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-cyan-400/25 bg-slate-950/60 px-5 py-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">
                {detail.badge[locale]}
              </p>
              <h1 id="detail-dialog-title" className="mt-1 text-lg font-bold text-slate-50 sm:text-xl">
                {detail.title[locale]}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-slate-300">
                {detail.organization[locale]} · <span className="text-emerald-300">{detail.period[locale]}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={locale === 'es' ? 'Cerrar panel de detalle' : 'Close detail panel'}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
              autoFocus
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-200">
            <p className="text-slate-300">{detail.summary[locale]}</p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {detail.metrics.map((metric) => (
                <div
                  key={metric.label.en}
                  className="rounded-lg border border-cyan-400/20 bg-slate-900/60 px-3 py-2"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {metric.label[locale]}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-cyan-200">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-cyan-300">
                {locale === 'es' ? 'Aportes e Implementación' : 'Key Contributions'}
              </h2>
              <ul className="mt-2 space-y-1.5 text-slate-200">
                {detail.highlights[locale].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-cyan-300">
                {locale === 'es' ? 'Stack Tecnológico' : 'Technology Stack'}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 font-mono text-xs text-slate-300">
              {detail.architectureNote[locale]}
            </div>

            {detail.links && detail.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {detail.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer noopener' : undefined}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-3 py-1.5 font-mono text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-400/25"
                  >
                    <span>{link.label[locale]}</span>
                    {link.external && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      )}
    </dialog>
  );
}
