import {
  type FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Mail, Send, X } from 'lucide-react';
import {
  type InteractiveNodeId,
  NODE_DETAILS,
  PROFILE,
} from '@/data/portfolioData';
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

interface ComposerValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ComposerErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBJECT_PRESETS = {
  es: [
    'Oportunidad Full-Stack / Backend',
    'Ingeniería de Datos y ETL',
    'Colaboración en proyecto Web 3D',
  ],
  en: [
    'Full-Stack / Backend opportunity',
    'Data Engineering & ETL',
    'Web 3D project collaboration',
  ],
} as const;

export function DetailDialog25D() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);
  const isClosingRef = useRef(false);
  const lastActiveNodeRef = useRef<InteractiveNodeId | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const selectedNodeId = usePortfolioStore((s) => s.selectedNodeId);
  const openComposerOnModal = usePortfolioStore((s) => s.openComposerOnModal);
  const locale = usePortfolioStore((s) => s.locale);
  const selectNode = usePortfolioStore((s) => s.selectNode);
  const closeModal = usePortfolioStore((s) => s.closeModal);

  const [closingNodeId, setClosingNodeId] = useState<InteractiveNodeId | null>(null);
  const [composerMode, setComposerMode] = useState(false);
  const [values, setValues] = useState<ComposerValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [touched, setTouched] = useState<Record<keyof ComposerValues, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [errors, setErrors] = useState<ComposerErrors>({});
  const [submittedDraft, setSubmittedDraft] = useState<{
    mailtoHref: string;
    plainText: string;
  } | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  if (selectedNodeId) {
    lastActiveNodeRef.current = selectedNodeId;
  }

  const activeNodeId = selectedNodeId ?? closingNodeId;
  const detail = activeNodeId ? NODE_DETAILS[activeNodeId] : null;
  const isComposerView = detail?.id === 'contact-terminal' && composerMode;

  const validateField = useCallback(
    (field: keyof ComposerValues, rawValue: string): string | undefined => {
      const val = rawValue.trim();
      if (field === 'name' && val.length < 2) {
        return locale === 'es'
          ? 'Ingresa tu nombre o entidad (mínimo 2 caracteres).'
          : 'Enter your name or company (at least 2 characters).';
      }
      if (field === 'email' && !EMAIL_PATTERN.test(val)) {
        return locale === 'es'
          ? 'Ingresa un correo electrónico válido (ejemplo: nombre@empresa.com).'
          : 'Enter a valid email address (example: name@company.com).';
      }
      if (field === 'subject' && val.length < 3) {
        return locale === 'es'
          ? 'Indica un asunto breve (mínimo 3 caracteres).'
          : 'Provide a short subject (at least 3 characters).';
      }
      if (field === 'message' && val.length < 10) {
        return locale === 'es'
          ? 'Escribe los detalles del mensaje (mínimo 10 caracteres).'
          : 'Write the message details (at least 10 characters).';
      }
      return undefined;
    },
    [locale],
  );

  const closeDialogSmoothly = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open || isClosingRef.current) {
      closeModal();
      return;
    }

    const retainId = usePortfolioStore.getState().selectedNodeId ?? lastActiveNodeRef.current;
    setClosingNodeId(retainId);
    closeModal();

    if (typeof dialog.getAnimations !== 'function') {
      delete dialog.dataset.closing;
      dialog.close();
      setClosingNodeId(null);
      setComposerMode(false);
      return;
    }

    isClosingRef.current = true;
    dialog.dataset.closing = 'true';

    const animations = dialog.getAnimations();
    if (animations.length === 0) {
      isClosingRef.current = false;
      delete dialog.dataset.closing;
      dialog.close();
      setClosingNodeId(null);
      setComposerMode(false);
      return;
    }

    let settled = false;
    const finishClose = () => {
      if (settled) return;
      settled = true;
      isClosingRef.current = false;
      delete dialog.dataset.closing;
      if (dialog.open) dialog.close();
      if (!usePortfolioStore.getState().selectedNodeId) {
        setClosingNodeId(null);
        setComposerMode(false);
      }
    };

    const timerId = window.setTimeout(finishClose, 260);
    Promise.allSettled(animations.map((anim) => anim.finished)).then(() => {
      window.clearTimeout(timerId);
      finishClose();
    });
  }, [closeModal]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedNodeId) {
      isClosingRef.current = false;
      delete dialog.dataset.closing;
      setClosingNodeId(null);

      if (selectedNodeId === 'contact-terminal') {
        setComposerMode(Boolean(openComposerOnModal));
      } else {
        setComposerMode(false);
      }

      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open && !isClosingRef.current) {
      closeDialogSmoothly();
    }
  }, [selectedNodeId, openComposerOnModal, closeDialogSmoothly]);

  useEffect(() => {
    if (isComposerView) {
      window.requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [isComposerView]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => {
      isClosingRef.current = false;
      delete dialog.dataset.closing;
      dialog.returnValue = '';
      setClosingNodeId(null);
      setComposerMode(false);
      closeModal();
    };

    const onCancel = (e: Event) => {
      e.preventDefault();
      closeDialogSmoothly();
    };

    const onPointerDown = (e: PointerEvent) => {
      pressedOutsideRef.current = isPointerOutside(e, dialog);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutsideRef.current && isPointerOutside(e, dialog)) {
        closeDialogSmoothly();
      }
      pressedOutsideRef.current = false;
    };

    dialog.addEventListener('close', onClose);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);

    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [closeModal, closeDialogSmoothly]);

  const siblingNodes = detail
    ? (Object.keys(NODE_DETAILS) as InteractiveNodeId[])
        .map((id) => NODE_DETAILS[id])
        .filter((d) => d.stationId === detail.stationId)
    : [];

  const handleFieldChange = (field: keyof ComposerValues, nextVal: string) => {
    setValues((prev) => ({ ...prev, [field]: nextVal }));
    setSubmittedDraft(null);
    if (touched[field] || errors[field]) {
      const nextErr = validateField(field, nextVal);
      setErrors((prev) => ({ ...prev, [field]: nextErr }));
    }
  };

  const handleFieldBlur = (field: keyof ComposerValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErr = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: nextErr }));
  };

  const handleComposerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: ComposerErrors = {
      name: validateField('name', values.name),
      email: validateField('email', values.email),
      subject: validateField('subject', values.subject),
      message: validateField('message', values.message),
    };

    setTouched({ name: true, email: true, subject: true, message: true });
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameInputRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (nextErrors.subject) {
      subjectInputRef.current?.focus();
      return;
    }
    if (nextErrors.message) {
      messageInputRef.current?.focus();
      return;
    }

    const cleanName = values.name.trim();
    const cleanEmail = values.email.trim();
    const cleanSubject = values.subject.trim();
    const cleanMessage = values.message.trim();

    const formattedBody = [
      `${locale === 'es' ? 'Remitente' : 'From'}: ${cleanName} <${cleanEmail}>`,
      '',
      cleanMessage,
    ].join('\n');

    const mailtoHref = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
      cleanSubject,
    )}&body=${encodeURIComponent(formattedBody)}`;

    const plainText = `Para: ${PROFILE.email}\nDe: ${cleanName} <${cleanEmail}>\nAsunto: ${cleanSubject}\n\n${cleanMessage}`;

    setSubmittedDraft({ mailtoHref, plainText });

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
        setCopiedFeedback(true);
        window.setTimeout(() => setCopiedFeedback(false), 2600);
      }
    } catch {
      // Clipboard API may be unavailable in restricted contexts; mailto fallback stays active.
    }
  };

  const handleCopyDraft = async () => {
    if (!submittedDraft) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(submittedDraft.plainText);
        setCopiedFeedback(true);
        window.setTimeout(() => setCopiedFeedback(false), 2600);
      }
    } catch {
      setCopiedFeedback(false);
    }
  };

  const defaultHighlightsHeading =
    locale === 'es' ? 'Aportes y responsabilidades' : 'Work & responsibilities';
  const highlightsHeading = detail?.highlightsTitle?.[locale] ?? defaultHighlightsHeading;

  return (
    <dialog
      ref={dialogRef}
      className="studio-dialog"
      aria-labelledby="detail-dialog-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {detail && (
        <article className="flex max-h-[86dvh] flex-col overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div key={`${detail.id}-hdr-${isComposerView ? 'c' : 'o'}`} className="studio-content-swap min-w-0">
                <p className="text-xs font-medium text-[var(--accent-primary)]">
                  {isComposerView
                    ? locale === 'es'
                      ? 'Correo directo · Frontend Mailer'
                      : 'Direct email · Frontend Mailer'
                    : detail.category[locale]}
                </p>
                <h1
                  id="detail-dialog-title"
                  className="mt-1 font-display text-xl font-medium leading-tight text-[var(--text-primary)] sm:text-2xl"
                >
                  {isComposerView
                    ? locale === 'es'
                      ? `Redactar mensaje para ${PROFILE.shortName}`
                      : `Compose email to ${PROFILE.shortName}`
                    : detail.title[locale]}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {isComposerView
                    ? `${PROFILE.email} · ${PROFILE.location}`
                    : `${detail.organization[locale]} · ${detail.period[locale]}`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialogSmoothly}
                aria-label={locale === 'es' ? 'Cerrar panel de detalle' : 'Close detail panel'}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] studio-control"
                autoFocus
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {siblingNodes.length > 1 && (
              <div
                role="tablist"
                aria-label={
                  locale === 'es' ? 'Modelos de esta estación' : 'Models in this station'
                }
                className="flex flex-wrap items-center gap-1.5 pt-1"
              >
                {siblingNodes.map((node) => {
                  const isCurrent = node.id === detail.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => selectNode(node.id)}
                      className={`rounded-[4px] px-2.5 py-1 text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'border border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                          : 'studio-control text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {node.actionLabel[locale]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isComposerView ? (
            <div
              key="contact-composer-view"
              className="studio-content-swap overflow-y-auto overscroll-contain p-5 sm:p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedDraft(null);
                    setComposerMode(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium studio-control"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {locale === 'es'
                      ? 'Volver a canales y referencias'
                      : 'Back to channels & references'}
                  </span>
                </button>

                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  {locale === 'es' ? 'Destinatario:' : 'To:'} {PROFILE.email}
                </span>
              </div>

              {submittedDraft ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="studio-content-swap space-y-4 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5"
                >
                  <div className="rounded-[6px] border border-[var(--status-ok)] bg-[var(--status-ok-soft)] p-3.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {locale === 'es'
                        ? 'Mensaje preparado y copiado al portapapeles'
                        : 'Message prepared and copied to clipboard'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {locale === 'es'
                        ? `El borrador para ${PROFILE.email} está listo. Abre tu cliente de correo o pega el texto directamente.`
                        : `Your draft for ${PROFILE.email} is ready. Open your mail client or paste the message directly.`}
                    </p>
                  </div>

                  <pre className="max-h-44 overflow-y-auto rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                    {submittedDraft.plainText}
                  </pre>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={submittedDraft.mailtoHref}
                      className="inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-xs font-semibold studio-cta"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {locale === 'es'
                          ? 'Abrir en cliente de correo'
                          : 'Open in email client'}
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-medium studio-control"
                    >
                      {copiedFeedback ? (
                        <Check
                          className="h-3.5 w-3.5 text-[var(--status-ok)]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {copiedFeedback
                          ? locale === 'es'
                            ? 'Copiado'
                            : 'Copied'
                          : locale === 'es'
                            ? 'Copiar texto'
                            : 'Copy text'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubmittedDraft(null)}
                      className="inline-flex items-center rounded-[6px] px-3 py-2 text-xs font-medium studio-control"
                    >
                      {locale === 'es' ? 'Editar mensaje' : 'Edit message'}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleComposerSubmit}
                  className="space-y-4 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5"
                >
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-[var(--text-primary)]"
                      >
                        {locale === 'es'
                          ? 'Nombre o entidad'
                          : 'Name or organization'}
                      </label>
                      <input
                        ref={nameInputRef}
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={values.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => handleFieldBlur('name')}
                        placeholder={
                          locale === 'es'
                            ? 'Ej. Ana Gómez / Tech Recruiter'
                            : 'e.g. Jane Doe / Tech Recruiter'
                        }
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className="studio-input mt-1.5 w-full px-3 py-2 text-xs"
                      />
                      {errors.name && (
                        <p
                          id="contact-name-error"
                          role="alert"
                          className="mt-1 text-[11px] font-medium text-[var(--status-error)]"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-[var(--text-primary)]"
                      >
                        {locale === 'es' ? 'Correo de respuesta' : 'Reply-to email'}
                      </label>
                      <input
                        ref={emailInputRef}
                        id="contact-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        placeholder={
                          locale === 'es'
                            ? 'nombre@empresa.com'
                            : 'name@company.com'
                        }
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? 'contact-email-error' : undefined
                        }
                        className="studio-input mt-1.5 w-full px-3 py-2 text-xs"
                      />
                      {errors.email && (
                        <p
                          id="contact-email-error"
                          role="alert"
                          className="mt-1 text-[11px] font-medium text-[var(--status-error)]"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-medium text-[var(--text-primary)]"
                    >
                      {locale === 'es' ? 'Asunto' : 'Subject'}
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 pb-2">
                      {SUBJECT_PRESETS[locale].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleFieldChange('subject', preset)}
                          className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      ref={subjectInputRef}
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={values.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      onBlur={() => handleFieldBlur('subject')}
                      placeholder={
                        locale === 'es'
                          ? 'Propuesta de rol o consulta técnica'
                          : 'Role proposal or technical inquiry'
                      }
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={
                        errors.subject ? 'contact-subject-error' : undefined
                      }
                      className="studio-input w-full px-3 py-2 text-xs"
                    />
                    {errors.subject && (
                      <p
                        id="contact-subject-error"
                        role="alert"
                        className="mt-1 text-[11px] font-medium text-[var(--status-error)]"
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-[var(--text-primary)]"
                    >
                      {locale === 'es' ? 'Mensaje' : 'Message'}
                    </label>
                    <textarea
                      ref={messageInputRef}
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={values.message}
                      onChange={(e) => handleFieldChange('message', e.target.value)}
                      onBlur={() => handleFieldBlur('message')}
                      placeholder={
                        locale === 'es'
                          ? 'Describe el equipo, alcance del proyecto o disponibilidad para conversar...'
                          : 'Describe the team, project scope, or availability to talk...'
                      }
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? 'contact-message-error' : undefined
                      }
                      className="studio-input mt-1.5 w-full resize-y px-3 py-2 text-xs leading-relaxed"
                    />
                    {errors.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="mt-1 text-[11px] font-medium text-[var(--status-error)]"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {locale === 'es'
                        ? 'Prepara el borrador en tu portapapeles y enlaza con tu cliente de correo.'
                        : 'Prepares the draft in your clipboard and hands off to your mail client.'}
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2 text-xs font-semibold studio-cta"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {locale === 'es' ? 'Preparar y enviar correo' : 'Prepare & send email'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div
              key={`${detail.id}-overview-view`}
              className="studio-content-swap grid grid-cols-1 overflow-y-auto overscroll-contain md:grid-cols-[1.02fr_1.42fr]"
            >
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
                    {detail.links.map((link) => {
                      if (link.action === 'compose-email') {
                        return (
                          <button
                            key={link.label.en}
                            type="button"
                            onClick={() => {
                              setSubmittedDraft(null);
                              setComposerMode(true);
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-xs font-medium ${
                              link.primary ? 'font-semibold studio-cta' : 'studio-control'
                            }`}
                          >
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{link.label[locale]}</span>
                          </button>
                        );
                      }

                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noreferrer noopener' : undefined}
                          className={`inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-2 text-xs font-medium ${
                            link.primary ? 'font-semibold studio-cta' : 'studio-control'
                          }`}
                        >
                          <span>{link.label[locale]}</span>
                          {link.external && (
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}

                <p className="border-t border-[var(--border-subtle)] pt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {detail.sceneContext[locale]}
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <div>
                  <h2 className="text-xs font-semibold text-[var(--text-secondary)]">
                    {highlightsHeading}
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

                  {detail.highlightsFooterNote && (
                    <p className="mt-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {detail.highlightsFooterNote[locale]}
                    </p>
                  )}
                </div>

                <div>
                  <h2 className="text-xs font-semibold text-[var(--text-secondary)]">
                    {detail.id === 'contact-terminal'
                      ? locale === 'es'
                        ? 'Canales disponibles'
                        : 'Available channels'
                      : locale === 'es'
                        ? 'Tecnologías aplicadas'
                        : 'Technologies used'}
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
          )}
        </article>
      )}
    </dialog>
  );
}
