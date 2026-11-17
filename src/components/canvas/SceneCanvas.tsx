import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, type RootState, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, Preload } from '@react-three/drei';
import { Selection } from '@react-three/postprocessing';
import { INTERACTIVE_LAYER } from '@/hooks/useInteractiveLayer';
import { useWindowResize } from '@/hooks/useWindowResize';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

function SceneReadyAndTelemetry() {
  const setAssetReady = usePortfolioStore((s) => s.setAssetReady);
  const setRenderStats = usePortfolioStore((s) => s.setRenderStats);
  const frameCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const initialSampledRef = useRef(false);
  const sceneRenderMetricsRef = useRef({ calls: 0, triangles: 0 });

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setAssetReady(true);
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [setAssetReady]);

  useFrame((state, delta) => {
    state.scene.onAfterRender = (renderer) => {
      sceneRenderMetricsRef.current.calls = renderer.info.render.calls;
      sceneRenderMetricsRef.current.triangles = renderer.info.render.triangles;
    };

    frameCountRef.current += 1;
    elapsedRef.current += delta;

    const calls =
      sceneRenderMetricsRef.current.calls || state.gl.info.render.calls;
    const triangles =
      sceneRenderMetricsRef.current.triangles || state.gl.info.render.triangles;

    if (!initialSampledRef.current && frameCountRef.current >= 4 && calls > 1) {
      initialSampledRef.current = true;
      setRenderStats({
        fps: 60,
        calls,
        triangles,
        geometries: state.gl.info.memory.geometries,
        textures: state.gl.info.memory.textures,
      });
    }

    if (elapsedRef.current >= 1.0) {
      const fps = Math.min(
        144,
        Math.max(1, Math.round(frameCountRef.current / elapsedRef.current)),
      );
      setRenderStats({
        fps,
        calls,
        triangles,
        geometries: state.gl.info.memory.geometries,
        textures: state.gl.info.memory.textures,
      });
      frameCountRef.current = 0;
      elapsedRef.current = 0;
    }
  });

  return null;
}

interface SceneCanvasProps {
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  message: string;
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WebGL Scene Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-stage)] p-6 text-center">
          <div className="studio-surface max-w-md rounded-[8px] p-6">
            <h2 className="font-display text-lg font-medium text-[var(--text-primary)]">
              Entorno WebGL2 no disponible
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              El navegador no pudo inicializar la aceleración 3D ({this.state.message}). Recarga la página o habilita la aceleración por hardware.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function SceneCanvas({ children }: SceneCanvasProps) {
  const [rootState, setRootState] = useState<RootState | null>(null);
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);
  const stepDownQuality = usePortfolioStore((s) => s.stepDownQuality);

  useWindowResize(rootState, 12);

  const dprRange: [number, number] =
    qualityPreset === 'performance'
      ? [1, 1]
      : qualityPreset === 'balanced'
        ? [1, 1.5]
        : [1, 2];

  const enableShadows = qualityPreset !== 'performance';

  useEffect(() => {
    if (!rootState) return;
    rootState.gl.shadowMap.enabled = enableShadows;
    rootState.gl.shadowMap.needsUpdate = true;
  }, [rootState, enableShadows]);

  return (
    <CanvasErrorBoundary>
      <Canvas
        shadows={enableShadows}
        dpr={dprRange}
        camera={{ fov: 45, near: 0.1, far: 140, position: [0, 3.3, 7.2] }}
        gl={{
          antialias: qualityPreset === 'performance',
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.02,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={(state) => {
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.shadowMap.enabled = enableShadows;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          // Filter Raycaster strictly to INTERACTIVE_LAYER (layer 1)
          state.raycaster.layers.set(INTERACTIVE_LAYER);
          setRootState(state);
        }}
      >
        <PerformanceMonitor
          flipflops={2}
          onDecline={() => {
            stepDownQuality();
          }}
        />
        <Suspense fallback={null}>
          <Selection>{children}</Selection>
          <Preload all />
          <SceneReadyAndTelemetry />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
