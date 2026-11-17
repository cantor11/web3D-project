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
      focusedNodeId: null,
      openComposerOnModal: false,
      locale: 'es',
      theme: 'dark',
      qualityPreset: 'balanced',
      autoQuality: true,
    });
  });

  it('keeps every station and node focus camera preset within polar [15deg, 85deg] and orbital distance [3.0, 18]', () => {
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

    for (const detail of Object.values(NODE_DETAILS)) {
      const cam = new THREE.Vector3(...detail.focusCameraPosition);
      const tgt = new THREE.Vector3(...detail.focusCameraTarget);
      const offset = cam.clone().sub(tgt);
      const dist = offset.length();
      const polarDeg = THREE.MathUtils.radToDeg(Math.acos(offset.y / dist));

      expect(dist).toBeGreaterThanOrEqual(3.0);
      expect(dist).toBeLessThanOrEqual(15);
      expect(polarDeg).toBeGreaterThanOrEqual(15);
      expect(polarDeg).toBeLessThanOrEqual(85);
      expect(detail.focusCameraPosition[0]).toBeCloseTo(detail.focusCameraTarget[0], 3);
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

  it('maps hash routes, LinkedIn URL, quality presets, and contains zero em dashes (R-02)', () => {
    expect(getStationFromHash('#experiencia')).toBe('experiencia');
    expect(getStationFromHash('#invalid')).toBeNull();

    expect(PROFILE.email).toBe('junior.cantor11@gmail.com');
    expect(PROFILE.linkedinUrl).toBe('https://www.linkedin.com/in/junior-cantor-arevalo/');
    expect(
      NODE_DETAILS['contact-terminal'].links?.some(
        (l) => l.href === 'https://www.linkedin.com/in/junior-cantor-arevalo/',
      ),
    ).toBe(true);
    expect(NODE_DETAILS['uplanner-rack'].highlights.es.join(' ')).toContain('Polars');
    expect(NODE_DETAILS['uplanner-rack'].highlights.es.join(' ')).toContain('Airflow');
    expect(NODE_DETAILS['gss-mobile'].highlights.es.join(' ')).toContain('REST');

    const serializedData = JSON.stringify({ PROFILE, STATIONS, NODE_DETAILS });
    expect(serializedData).not.toContain('\u2014');
    // Phone numbers belong in downloadable PDF CV rather than scraped JSON metadata
    expect(serializedData).not.toMatch(/\+57\s*3\d{2}/);

    // Quality preset step-down & manual override
    usePortfolioStore.getState().setQualityPreset('ultra');
    expect(usePortfolioStore.getState().qualityPreset).toBe('ultra');
    expect(usePortfolioStore.getState().autoQuality).toBe(false);

    usePortfolioStore.getState().setAutoQuality(true);
    usePortfolioStore.getState().stepDownQuality();
    expect(usePortfolioStore.getState().qualityPreset).toBe('balanced');
    usePortfolioStore.getState().stepDownQuality();
    expect(usePortfolioStore.getState().qualityPreset).toBe('performance');

    usePortfolioStore.getState().toggleLocale();
    expect(usePortfolioStore.getState().locale).toBe('en');

    usePortfolioStore.getState().toggleTheme();
    expect(usePortfolioStore.getState().theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
