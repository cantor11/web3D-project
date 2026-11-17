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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstMount = useRef(true);
  const prevStationRef = useRef<StationId>('sobre-mi');

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

  // Station-to-station cinematic flight with adaptive duration and vertical arc
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
      prevStationRef.current = targetSection;
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

    const dist = Math.hypot(
      camX - camera.position.x,
      camY - camera.position.y,
      camZ - camera.position.z,
    );
    const duration = prefersReducedMotion
      ? 0.01
      : THREE.MathUtils.clamp(0.82 + dist * 0.016, 0.88, 1.28);
    const arcLiftY = Math.max(camera.position.y, camY) + Math.min(dist * 0.045, 0.95);

    controls.enabled = false;
    const activeRequestId = transitionRequestId;
    const destinationId: StationId = targetSection;
    prevStationRef.current = targetSection;

    const tl = gsap.timeline({
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

    tl.to(
      camera.position,
      {
        x: camX,
        z: camZ,
        duration,
        ease: 'power3.inOut',
      },
      0,
    );

    if (!prefersReducedMotion && dist > 4) {
      tl.to(
        camera.position,
        {
          y: arcLiftY,
          duration: duration * 0.44,
          ease: 'power2.out',
        },
        0,
      ).to(
        camera.position,
        {
          y: camY,
          duration: duration * 0.56,
          ease: 'power2.inOut',
        },
        duration * 0.44,
      );
    } else {
      tl.to(
        camera.position,
        {
          y: camY,
          duration,
          ease: 'power3.inOut',
        },
        0,
      );
    }

    tl.to(
      controls.target,
      {
        x: tgtX,
        y: tgtY,
        z: tgtZ,
        duration,
        ease: 'power3.inOut',
      },
      0,
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [camera, targetSection, transitionRequestId, completeTransition]);

  // Smooth sub-node focus glide when selecting/switching between 3D models or closing modal
  useEffect(() => {
    if (isFirstMount.current) return;
    const controls = controlsRef.current;
    if (!controls) return;

    const station = getStationById(usePortfolioStore.getState().targetSection);
    const focusedDetail = focusedNodeId ? NODE_DETAILS[focusedNodeId] : null;

    // Only focus if the focused node belongs to the active station (or relax to station overview)
    const rawCamPos =
      focusedDetail && focusedDetail.stationId === station.id
        ? focusedDetail.focusCameraPosition
        : station.cameraPosition;
    const rawTarget =
      focusedDetail && focusedDetail.stationId === station.id
        ? focusedDetail.focusCameraTarget
        : station.cameraTarget;

    const [camX, camY, camZ] = getResponsiveCameraCoords(rawCamPos, rawTarget);
    const [tgtX, tgtY, tgtZ] = rawTarget;

    const dist = Math.hypot(
      camX - camera.position.x,
      camY - camera.position.y,
      camZ - camera.position.z,
    );
    if (dist < 0.04) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0.01 : 0.76;

    const tl = gsap.timeline({
      defaults: { duration, ease: 'power3.out' },
      onUpdate: () => {
        controls.update();
      },
      onComplete: () => {
        controls.enabled = true;
        controls.update();
      },
    });

    tl.to(camera.position, { x: camX, y: camY, z: camZ }, 0);
    tl.to(controls.target, { x: tgtX, y: tgtY, z: tgtZ }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [camera, focusedNodeId]);

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
