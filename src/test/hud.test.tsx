import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomTelemetryHUD } from '@/components/hud/BottomTelemetryHUD';
import { ReactiveCursor } from '@/components/hud/ReactiveCursor';
import { TopNavHUD } from '@/components/hud/TopNavHUD';
import { DetailDialog25D } from '@/components/modals/DetailDialog25D';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('HUD, Theme Switcher, Graphics Config, Email Composer & DetailDialog25D', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '#sobre-mi');
    document.documentElement.dataset.theme = 'dark';
    usePortfolioStore.setState({
      currentSection: 'sobre-mi',
      targetSection: 'sobre-mi',
      isTransitioning: false,
      transitionRequestId: 0,
      hoveredNodeId: null,
      selectedNodeId: null,
      focusedNodeId: null,
      openComposerOnModal: false,
      locale: 'es',
      theme: 'dark',
      qualityPreset: 'balanced',
      autoQuality: true,
    });

    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    });
  });

  it('renders 5 station navigation controls, switches locale ES/EN, dark/light themes, and graphics presets', () => {
    render(<TopNavHUD />);

    expect(screen.getByRole('button', { name: /Experiencia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Habilidades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contacto/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Experiencia/i }));
    expect(usePortfolioStore.getState().targetSection).toBe('experiencia');
    expect(window.location.hash).toBe('#experiencia');

    // Open graphics quality config tray and switch presets
    const graphicsBtn = screen.getByRole('button', { name: /Configurar calidad gráfica/i });
    fireEvent.click(graphicsBtn);
    expect(graphicsBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Rendimiento' }));
    expect(usePortfolioStore.getState().qualityPreset).toBe('performance');

    fireEvent.click(screen.getByRole('button', { name: 'Máximo' }));
    expect(usePortfolioStore.getState().qualityPreset).toBe('ultra');

    fireEvent.click(screen.getByRole('button', { name: /Cambiar a tema claro/i }));
    expect(usePortfolioStore.getState().theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: /Cambiar idioma/i }));
    expect(usePortfolioStore.getState().locale).toBe('en');
    expect(screen.getByRole('button', { name: /Experience/i })).toBeInTheDocument();
  });

  it('opens mobile section drawer cleanly and closes on Escape', () => {
    render(<TopNavHUD />);

    const drawerBtn = screen.getByRole('button', { name: /Abrir navegación de secciones/i });
    expect(drawerBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(drawerBtn);
    expect(drawerBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(drawerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens Uplanner, GSS, Certifications, and Contact modal with LinkedIn & interactive frontend email composer', () => {
    render(<DetailDialog25D />);

    act(() => {
      usePortfolioStore.getState().selectNode('uplanner-rack');
    });
    expect(screen.getByText(/Practicante de Ingeniería de Software/i)).toBeInTheDocument();
    expect(screen.getByText(/Airflow utilizando Polars/i)).toBeInTheDocument();

    act(() => {
      usePortfolioStore.getState().selectNode('gss-mobile');
    });
    expect(screen.getByText(/Global System Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/registro, seguimiento y gestión de pedidos/i)).toBeInTheDocument();

    expect(NODE_DETAILS['certifications-totem'].highlights.es).toHaveLength(10);
    expect(NODE_DETAILS['certifications-totem'].highlights.en).toHaveLength(10);

    // Open Contact terminal modal -> main overview should show References without Email Composer stacked beside it
    act(() => {
      usePortfolioStore.getState().selectNode('contact-terminal');
    });

    expect(screen.getByRole('heading', { name: /Referencias profesionales/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Preparar y enviar correo/i })).not.toBeInTheDocument();

    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/junior-cantor-arevalo/',
    );

    // Click "Escribir correo" -> replaces dialog view with dedicated Email Composer + Back button
    fireEvent.click(screen.getByRole('button', { name: /Escribir correo/i }));
    const backBtn = screen.getByRole('button', { name: /Volver a canales y referencias/i });
    expect(backBtn).toBeInTheDocument();

    // Clicking Back returns to Contact overview + References
    fireEvent.click(backBtn);
    expect(screen.getByRole('heading', { name: /Referencias profesionales/i })).toBeInTheDocument();

    // Re-open Composer, validate empty submit, fill fields, and prepare draft
    fireEvent.click(screen.getByRole('button', { name: /Escribir correo/i }));

    const submitBtn = screen.getByRole('button', { name: /Preparar y enviar correo/i });
    fireEvent.click(submitBtn);

    // Validation errors should appear for empty fields
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(4);

    fireEvent.change(screen.getByLabelText(/Nombre o entidad/i), {
      target: { value: 'Elena Vargas' },
    });
    fireEvent.change(screen.getByLabelText(/Correo de respuesta/i), {
      target: { value: 'elena@techcorp.co' },
    });
    fireEvent.change(screen.getByLabelText(/Asunto/i), {
      target: { value: 'Oportunidad Full-Stack / Backend' },
    });
    fireEvent.change(screen.getByLabelText(/^Mensaje$/i), {
      target: {
        value: 'Hola Junior, nos interesa conversar sobre una vacante de ingeniería de software.',
      },
    });

    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/Mensaje preparado y copiado al portapapeles/i),
    ).toBeInTheDocument();
    const mailtoLink = screen.getByRole('link', { name: /Abrir en cliente de correo/i });
    expect(mailtoLink.getAttribute('href')).toContain('mailto:junior.cantor11@gmail.com');
  });

  it('transitions ReactiveCursor between default, hover, and active states (SUB-11)', () => {
    render(
      <>
        <ReactiveCursor />
        <BottomTelemetryHUD />
      </>,
    );

    const cursor = screen.getByTestId('reactive-cursor');
    expect(cursor).toHaveAttribute('data-cursor-state', 'default');

    act(() => {
      usePortfolioStore.getState().setHoveredNode('uplanner-rack');
    });
    expect(cursor).toHaveAttribute('data-cursor-state', 'hover');

    act(() => {
      fireEvent.pointerDown(window);
    });
    expect(cursor).toHaveAttribute('data-cursor-state', 'active');

    act(() => {
      fireEvent.pointerUp(window);
    });
    expect(cursor).toHaveAttribute('data-cursor-state', 'hover');
  });
});
