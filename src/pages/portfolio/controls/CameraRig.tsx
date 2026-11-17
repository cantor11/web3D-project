import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { getStationById, STATIONS, type StationId } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

const MIN_POLAR_RAD = THREE.MathUtils.degToRad(15);
const MAX_POLAR_RAD = THREE.MathUtils.degToRad(85);
const TRANSITION_DURATION_SEC = 1.8;

function getResponsiveCameraCoords(
  camPos: [number, number, number],
  targetPos: [number, number, number],
): [number, number, number] {
  if (typeof window === 'undefined') return camPos;
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  if (aspect >= 1.0) return camPos;
  const scale = aspect < 0.65 ? 1.85 : 1.3;
  const dx = camPos[0] - targetPos[0];
  const dy = camPos[1] - targetPos[1];
  const dz = camPos[2] - targetPos[2];
  return [
    targetPos[0] + dx * scale,
    targetPos[1] + dy * scale,
    targetPos[2] + dz * scale,
  ];
}

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstMount = useRef(true);

  const { camera } = useThree();
  const targetSection = usePortfolioStore((s) => s.targetSection);
  const transitionRequestId = usePortfolioStore((s) => s.transitionRequestId);
  const completeTransition = usePortfolioStore((s) => s.completeTransition);
  const navigateTo = usePortfolioStore((s) => s.navigateTo);
  const stepStation = usePortfolioStore((s) => s.stepStation);
  const syncFromHash = usePortfolioStore((s) => s.syncFromHash);

  useEffect(() => {
    const onPopState = () => {
      syncFromHash(window.location.hash);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncFromHash]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          document.querySelector('dialog[open]'))
      ) {
        return;
      }

      if (event.key >= '1' && event.key <= '5') {
        const index = Number(event.key) - 1;
        const station = STATIONS[index];
        if (station) navigateTo(station.id);
      } else if (event.key === 'ArrowRight') {
        stepStation(1);
      } else if (event.key === 'ArrowLeft') {
        stepStation(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigateTo, stepStation]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const station = getStationById(targetSection);
    const [tgtX, tgtY, tgtZ] = station.cameraTarget;
    const [camX, camY, camZ] = getResponsiveCameraCoords(
      station.cameraPosition,
      station.cameraTarget,
    );

    if (isFirstMount.current) {
      isFirstMount.current = false;
      camera.position.set(camX, camY, camZ);
      controls.target.set(tgtX, tgtY, tgtZ);
      controls.update();
      completeTransition(targetSection, transitionRequestId);
      return;
    }

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0.01 : TRANSITION_DURATION_SEC;

    controls.enabled = false;
    const activeRequestId = transitionRequestId;
    const destinationId: StationId = targetSection;

    const tl = gsap.timeline({
      defaults: { duration, ease: 'power3.inOut' },
      onUpdate: () => {
        controls.update();
      },
      onComplete: () => {
        controls.enabled = true;
        controls.update();
        completeTransition(destinationId, activeRequestId);
      },
      onInterrupt: () => {
        controls.enabled = true;
      },
    });

    tl.to(camera.position, { x: camX, y: camY, z: camZ }, 0);
    tl.to(controls.target, { x: tgtX, y: tgtY, z: tgtZ }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [camera, targetSection, transitionRequestId, completeTransition]);

  useEffect(() => {
    const onResizeReframe = () => {
      if (usePortfolioStore.getState().isTransitioning) return;
      const controls = controlsRef.current;
      if (!controls) return;
      const activeStation = getStationById(usePortfolioStore.getState().targetSection);
      const [camX, camY, camZ] = getResponsiveCameraCoords(
        activeStation.cameraPosition,
        activeStation.cameraTarget,
      );
      const [tgtX, tgtY, tgtZ] = activeStation.cameraTarget;
      camera.position.set(camX, camY, camZ);
      controls.target.set(tgtX, tgtY, tgtZ);
      controls.update();
    };

    window.addEventListener('resize', onResizeReframe, { passive: true });
    window.addEventListener('orientationchange', onResizeReframe, { passive: true });
    return () => {
      window.removeEventListener('resize', onResizeReframe);
      window.removeEventListener('orientationchange', onResizeReframe);
    };
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      enablePan={false}
      minDistance={3.2}
      maxDistance={22}
      minPolarAngle={MIN_POLAR_RAD}
      maxPolarAngle={MAX_POLAR_RAD}
      rotateSpeed={0.75}
      zoomSpeed={0.85}
    />
  );
}
