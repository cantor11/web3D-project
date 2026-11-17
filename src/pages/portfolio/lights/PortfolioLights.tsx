import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function PortfolioLights() {
  const isDark = usePortfolioStore((s) => s.theme === 'dark');
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);

  const castShadow = qualityPreset !== 'performance';
  const shadowSize = qualityPreset === 'ultra' ? 2048 : 1024;

  return (
    <>
      <ambientLight intensity={isDark ? 0.42 : 0.62} color="#f5f0e6" />
      <hemisphereLight
        args={[
          isDark ? '#f2ece1' : '#ffffff',
          isDark ? '#1c1a17' : '#d8d1c2',
          isDark ? 0.58 : 0.72,
        ]}
      />

      {/* Primary Architectural Key Light */}
      <directionalLight
        position={[12, 18, 12]}
        intensity={isDark ? 2.15 : 2.35}
        color="#fff6eb"
        castShadow={castShadow}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={65}
      />

      {/* Cool Overcast Rim / Fill */}
      <directionalLight
        position={[-10, 8, 14]}
        intensity={isDark ? 0.85 : 0.95}
        color="#d8e0eb"
      />

      {/* Warm Gallery Exhibit Accent Lights */}
      <pointLight
        position={[0, 4.4, 2.6]}
        intensity={10}
        distance={13}
        decay={2}
        color="#f3dfca"
      />
      {qualityPreset !== 'performance' && (
        <>
          <pointLight
            position={[12.5, 4.4, 0.5]}
            intensity={11}
            distance={13}
            decay={2}
            color="#eedcc8"
          />
          <pointLight
            position={[16.2, 4.0, 0.8]}
            intensity={10}
            distance={12}
            decay={2}
            color="#f3dfca"
          />
          <pointLight
            position={[-14, 4.4, 0.8]}
            intensity={11}
            distance={14}
            decay={2}
            color="#efe2d4"
          />
          <pointLight
            position={[10.5, 4.2, -11.5]}
            intensity={10}
            distance={13}
            decay={2}
            color="#f2dfcc"
          />
          <pointLight
            position={[-10.5, 4.2, -11.5]}
            intensity={10}
            distance={13}
            decay={2}
            color="#f4dec6"
          />
        </>
      )}
    </>
  );
}
