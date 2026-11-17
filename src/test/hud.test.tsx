import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TopNavHUD } from '@/components/hud/TopNavHUD';
import { DetailDialog25D } from '@/components/modals/DetailDialog25D';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('HUD & DetailDialog25D interactions', () => {
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

    // JSDOM lacks native HTMLDialogElement.prototype.showModal / close
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

  it('opens Uplanner and GSS 2.5D modal cards with real CV achievements', () => {
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
  });
});
