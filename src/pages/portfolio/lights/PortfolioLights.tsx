import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function PortfolioLights() {
  const isDark = usePortfolioStore((s) => s.theme === 'dark');
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);

  const castShadow = qualityPreset !== 'performance';
  const shadowSize = qualityPreset === 'ultra' ? 2048 : 1024;

  useEffect(() => {
    const light = keyLightRef.current;
    if (!light) return;
    if (light.shadow.map) {
      light.shadow.map.dispose();
      light.shadow.map = null;
    }
    light.shadow.mapSize.set(shadowSize, shadowSize);
    light.shadow.needsUpdate = true;

    return () => {
      if (light.shadow.map) {
        light.shadow.map.dispose();
        light.shadow.map = null;
      }
    };
  }, [shadowSize, castShadow]);

  return (
    <>
      <ambientLight intensity={isDark ? 0.24 : 0.36} color="#f5f0e6" />
      <hemisphereLight
        args={[
          isDark ? '#f2ece1' : '#ffffff',
          isDark ? '#1a1815' : '#cfc7b6',
          isDark ? 0.42 : 0.56,
        ]}
      />

      {/* Primary Architectural Key Light (remounted cleanly per shadow map resolution) */}
      <directionalLight
        key={`key-light-${shadowSize}-${castShadow}`}
        ref={keyLightRef}
        position={[11, 17, 11]}
        intensity={isDark ? 2.45 : 2.6}
        color="#fff6eb"
        castShadow={castShadow}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={qualityPreset === 'ultra' ? 2 : 1.5}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={20}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />

      {/* Cool Overcast Rim / Fill */}
      <directionalLight
        position={[-10, 8, 14]}
        intensity={isDark ? 0.68 : 0.78}
        color="#d8e0eb"
      />

      {/* Warm Gallery Exhibit Accent Lights */}
      <pointLight
        position={[0, 4.4, 2.6]}
        intensity={9.5}
        distance={13}
        decay={2}
        color="#f3dfca"
      />
      {qualityPreset !== 'performance' && (
        <>
          <pointLight
            position={[12.5, 4.4, 0.5]}
            intensity={10.5}
            distance={13}
            decay={2}
            color="#eedcc8"
          />
          <pointLight
            position={[16.2, 4.0, 0.8]}
            intensity={9.5}
            distance={12}
            decay={2}
            color="#f3dfca"
          />
          <pointLight
            position={[-14, 4.4, 0.8]}
            intensity={10.5}
            distance={14}
            decay={2}
            color="#efe2d4"
          />
          <pointLight
            position={[10.5, 4.2, -11.5]}
            intensity={9.5}
            distance={13}
            decay={2}
            color="#f2dfcc"
          />
          <pointLight
            position={[-10.5, 4.2, -11.5]}
            intensity={9.5}
            distance={13}
            decay={2}
            color="#f4dec6"
          />
        </>
      )}
    </>
  );
}
