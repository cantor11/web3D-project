import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomTelemetryHUD } from '@/components/hud/BottomTelemetryHUD';
import { ReactiveCursor } from '@/components/hud/ReactiveCursor';
import { TopNavHUD } from '@/components/hud/TopNavHUD';
import { DetailDialog25D } from '@/components/modals/DetailDialog25D';
import { NODE_DETAILS } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('HUD, ReactiveCursor & DetailDialog25D interactions', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '#sobre-mi');
    usePortfolioStore.setState({
      currentSection: 'sobre-mi',
      targetSection: 'sobre-mi',
      isTransitioning: false,
      transitionRequestId: 0,
      hoveredNodeId: null,
      selectedNodeId: null,
      locale: 'es',
    });

    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    });
  });

  it('renders 5 station navigation controls, switches locale ES/EN, and navigates', () => {
    render(<TopNavHUD />);

    expect(screen.getByRole('button', { name: /Experiencia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Habilidades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contacto/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Experiencia/i }));
    expect(usePortfolioStore.getState().targetSection).toBe('experiencia');
    expect(window.location.hash).toBe('#experiencia');

    fireEvent.click(screen.getByRole('button', { name: /Cambiar idioma/i }));
    expect(usePortfolioStore.getState().locale).toBe('en');
    expect(screen.getByRole('button', { name: /Experience/i })).toBeInTheDocument();
  });

  it('opens Uplanner, GSS, and 10-item Certifications 2.5D modal cards with real CV achievements', () => {
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
