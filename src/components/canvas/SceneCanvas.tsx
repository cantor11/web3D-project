import { Component, type ErrorInfo, type ReactNode, Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, type RootState } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Selection } from '@react-three/postprocessing';
import { INTERACTIVE_LAYER } from '@/hooks/useInteractiveLayer';
import { useWindowResize } from '@/hooks/useWindowResize';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

function SceneReadySignal() {
  const setAssetReady = usePortfolioStore((s) => s.setAssetReady);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setAssetReady(true);
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [setAssetReady]);

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
        <div className="flex h-full w-full items-center justify-center bg-[#090d16] p-6 text-center">
          <div className="hud-panel max-w-md rounded-xl p-6">
            <h2 className="font-mono text-sm uppercase tracking-widest text-cyan-400">
              WebGL2 Fallback
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              No fue posible inicializar el contexto WebGL2 en este navegador ({this.state.message}).
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

  useWindowResize(rootState, 12);

  return (
    <CanvasErrorBoundary>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 140, position: [0, 3.4, 7.6] }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={(state) => {
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          // Filter Raycaster strictly to INTERACTIVE_LAYER (layer 1)
          state.raycaster.layers.set(INTERACTIVE_LAYER);
          setRootState(state);
        }}
      >
        <Suspense fallback={null}>
          <Selection>{children}</Selection>
          <Preload all />
          <SceneReadySignal />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
