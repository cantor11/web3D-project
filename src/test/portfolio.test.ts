import { beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  NODE_DETAILS,
  PROFILE,
  STATIONS,
  getStationFromHash,
} from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('Portfolio spatial configuration & state machine', () => {
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
      theme: 'dark',
    });
  });

  it('keeps every station camera preset within polar [15deg, 85deg] and orbital distance [3.2, 18]', () => {
    for (const station of STATIONS) {
      const cam = new THREE.Vector3(...station.cameraPosition);
      const tgt = new THREE.Vector3(...station.cameraTarget);
      const offset = cam.clone().sub(tgt);
      const dist = offset.length();
      const polarDeg = THREE.MathUtils.radToDeg(Math.acos(offset.y / dist));

      expect(dist).toBeGreaterThanOrEqual(3.2);
      expect(dist).toBeLessThanOrEqual(18);
      expect(polarDeg).toBeGreaterThanOrEqual(15);
      expect(polarDeg).toBeLessThanOrEqual(85);
      expect(cam.y).toBeGreaterThan(0);
    }
  });

  it('resolves rapid concurrent station transitions cleanly to the latest requested target', () => {
    const store = usePortfolioStore.getState();

    store.navigateTo('experiencia');
    const firstReq = usePortfolioStore.getState().transitionRequestId;
    store.navigateTo('habilidades');
    const secondReq = usePortfolioStore.getState().transitionRequestId;
    store.navigateTo('proyectos');
    const finalReq = usePortfolioStore.getState().transitionRequestId;

    expect(window.location.hash).toBe('#proyectos');
    expect(usePortfolioStore.getState().isTransitioning).toBe(true);

    // Outdated completions must be ignored
    usePortfolioStore.getState().completeTransition('experiencia', firstReq);
    expect(usePortfolioStore.getState().isTransitioning).toBe(true);
    expect(usePortfolioStore.getState().targetSection).toBe('proyectos');

    usePortfolioStore.getState().completeTransition('habilidades', secondReq);
    expect(usePortfolioStore.getState().isTransitioning).toBe(true);

    // Latest completion finalizes cleanly
    usePortfolioStore.getState().completeTransition('proyectos', finalReq);
    expect(usePortfolioStore.getState().isTransitioning).toBe(false);
    expect(usePortfolioStore.getState().currentSection).toBe('proyectos');
  });

  it('maps hash routes, bilingual CV details, and contains zero em dashes (R-02)', () => {
    expect(getStationFromHash('#experiencia')).toBe('experiencia');
    expect(getStationFromHash('#invalid')).toBeNull();

    expect(PROFILE.email).toBe('junior.cantor11@gmail.com');
    expect(NODE_DETAILS['uplanner-rack'].highlights.es.join(' ')).toContain('Polars');
    expect(NODE_DETAILS['uplanner-rack'].highlights.es.join(' ')).toContain('Airflow');
    expect(NODE_DETAILS['gss-mobile'].highlights.es.join(' ')).toContain('REST');

    const serializedData = JSON.stringify({ PROFILE, STATIONS, NODE_DETAILS });
    expect(serializedData).not.toContain('\u2014');

    usePortfolioStore.getState().toggleLocale();
    expect(usePortfolioStore.getState().locale).toBe('en');

    usePortfolioStore.getState().toggleTheme();
    expect(usePortfolioStore.getState().theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
