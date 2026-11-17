import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  getStationById,
  NODE_DETAILS,
  STATIONS,
  type StationId,
} from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

const MIN_POLAR_RAD = THREE.MathUtils.degToRad(15);
const MAX_POLAR_RAD = THREE.MathUtils.degToRad(85);

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
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isFirstMount = useRef(true);
  const lastStationKeyRef = useRef<string>('');
  const pendingStationGoalRef = useRef<{ id: StationId; requestId: number } | null>(null);

  const { camera } = useThree();
  const targetSection = usePortfolioStore((s) => s.targetSection);
  const transitionRequestId = usePortfolioStore((s) => s.transitionRequestId);
  const focusedNodeId = usePortfolioStore((s) => s.focusedNodeId);
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

  // Unified camera flight & sub-node focus controller (prevents effect races)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const stationKey = `${targetSection}:${transitionRequestId}`;
    const isStationNavigation = stationKey !== lastStationKeyRef.current;
    lastStationKeyRef.current = stationKey;

    const station = getStationById(targetSection);
    const focusedDetail = focusedNodeId ? NODE_DETAILS[focusedNodeId] : null;
    const useFocusCoords =
      !isStationNavigation &&
      focusedDetail !== null &&
      focusedDetail.stationId === station.id;

    const rawCamPos = useFocusCoords
      ? focusedDetail.focusCameraPosition
      : station.cameraPosition;
    const rawTargetPos = useFocusCoords
      ? focusedDetail.focusCameraTarget
      : station.cameraTarget;

    const endCamCoords = getResponsiveCameraCoords(rawCamPos, rawTargetPos);
    const endCam = new THREE.Vector3(...endCamCoords);
    const endTarget = new THREE.Vector3(...rawTargetPos);

    if (isFirstMount.current) {
      isFirstMount.current = false;
      camera.position.copy(endCam);
      controls.target.copy(endTarget);
      controls.update();
      completeTransition(targetSection, transitionRequestId);
      return;
    }

    const startCam = camera.position.clone();
    const startTarget = controls.target.clone();
    const dist = startCam.distanceTo(endCam);

    if (!isStationNavigation && dist < 0.04) {
      return;
    }

    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const duration = prefersReducedMotion
      ? isStationNavigation
        ? 0.45
        : 0.28
      : isStationNavigation
        ? THREE.MathUtils.clamp(1.25 + dist * 0.02, 1.38, 1.85)
        : 0.85;

    const arcHeight =
      !prefersReducedMotion && isStationNavigation && dist > 4
        ? Math.min(dist * 0.075, 1.35)
        : 0;

    if (isStationNavigation) {
      pendingStationGoalRef.current = {
        id: targetSection,
        requestId: transitionRequestId,
      };
      controls.enabled = false;
    }

    const progress = { u: 0 };
    const tween = gsap.to(progress, {
      u: 1,
      duration,
      ease: isStationNavigation ? 'sine.inOut' : 'power2.out',
      onUpdate: () => {
        const u = progress.u;
        camera.position.x = THREE.MathUtils.lerp(startCam.x, endCam.x, u);
        camera.position.z = THREE.MathUtils.lerp(startCam.z, endCam.z, u);
        camera.position.y =
          THREE.MathUtils.lerp(startCam.y, endCam.y, u) +
          Math.sin(u * Math.PI) * arcHeight;
        controls.target.lerpVectors(startTarget, endTarget, u);
        controls.update();
      },
      onComplete: () => {
        controls.enabled = true;
        controls.update();
        if (pendingStationGoalRef.current) {
          const { id, requestId } = pendingStationGoalRef.current;
          pendingStationGoalRef.current = null;
          completeTransition(id, requestId);
        }
      },
      onInterrupt: () => {
        controls.enabled = true;
      },
    });

    tweenRef.current = tween;

    return () => {
      tween.kill();
    };
  }, [camera, targetSection, transitionRequestId, focusedNodeId, completeTransition]);

  useEffect(() => {
    const onResizeReframe = () => {
      if (usePortfolioStore.getState().isTransitioning) return;
      const controls = controlsRef.current;
      if (!controls) return;
      const state = usePortfolioStore.getState();
      const activeStation = getStationById(state.targetSection);
      const focusedDetail = state.focusedNodeId
        ? NODE_DETAILS[state.focusedNodeId]
        : null;
      const baseCam =
        focusedDetail && focusedDetail.stationId === activeStation.id
          ? focusedDetail.focusCameraPosition
          : activeStation.cameraPosition;
      const baseTarget =
        focusedDetail && focusedDetail.stationId === activeStation.id
          ? focusedDetail.focusCameraTarget
          : activeStation.cameraTarget;

      const [camX, camY, camZ] = getResponsiveCameraCoords(baseCam, baseTarget);
      const [tgtX, tgtY, tgtZ] = baseTarget;
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
      dampingFactor={0.055}
      enablePan={false}
      minDistance={3.0}
      maxDistance={22}
      minPolarAngle={MIN_POLAR_RAD}
      maxPolarAngle={MAX_POLAR_RAD}
      rotateSpeed={0.75}
      zoomSpeed={0.85}
    />
  );
}
