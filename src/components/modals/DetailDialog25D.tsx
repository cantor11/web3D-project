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
      className="studio-dialog"
      aria-labelledby="detail-dialog-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {detail && (
        <article className="flex max-h-[86dvh] flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--accent-primary)]">
                {detail.category[locale]}
              </p>
              <h1
                id="detail-dialog-title"
                className="mt-1 font-display text-xl font-medium leading-tight text-[var(--text-primary)] sm:text-2xl"
              >
                {detail.title[locale]}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {detail.organization[locale]} · {detail.period[locale]}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={locale === 'es' ? 'Cerrar panel de detalle' : 'Close detail panel'}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] transition-colors studio-control"
              autoFocus
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 overflow-y-auto overscroll-contain md:grid-cols-[1.05fr_1.4fr]">
            <div className="space-y-5 border-b border-[var(--border-subtle)] p-5 sm:p-6 md:border-r md:border-b-0">
              <p className="max-w-[58ch] text-sm leading-relaxed text-[var(--text-primary)]">
                {detail.summary[locale]}
              </p>

              <dl className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
                {detail.facts.map((fact) => (
                  <div
                    key={fact.label.en}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
                  >
                    <dt className="text-xs text-[var(--text-secondary)]">
                      {fact.label[locale]}
                    </dt>
                    <dd className="font-mono text-xs font-medium text-[var(--text-primary)]">
                      {fact.value[locale]}
                    </dd>
                  </div>
                ))}
              </dl>

              {detail.links && detail.links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {detail.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer noopener' : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-xs font-medium transition ${
                        link.primary ? 'font-semibold studio-cta' : 'studio-control'
                      }`}
                    >
                      <span>{link.label[locale]}</span>
                      {link.external && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                    </a>
                  ))}
                </div>
              )}

              <p className="border-t border-[var(--border-subtle)] pt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {detail.sceneContext[locale]}
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <h2 className="text-xs font-semibold text-[var(--text-secondary)]">
                  {locale === 'es' ? 'Aportes y responsabilidades' : 'Work & responsibilities'}
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--text-primary)]">
                  {detail.highlights[locale].map((item, idx) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-xs text-[var(--accent-primary)]"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xs font-semibold text-[var(--text-secondary)]">
                  {locale === 'es' ? 'Tecnologías aplicadas' : 'Technologies used'}
                </h2>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {detail.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-primary)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
    </dialog>
  );
}
