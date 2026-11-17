export function PortfolioLights() {
  return (
    <>
      <ambientLight intensity={0.45} color="#cbd5e1" />
      <hemisphereLight args={['#38bdf8', '#111827', 0.65]} />

      <directionalLight
        position={[12, 18, 12]}
        intensity={2.2}
        color="#f1f5f9"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={65}
      />

      {/* Soft front architectural fill so dark metallic PBR details read crisply */}
      <directionalLight position={[-8, 6, 14]} intensity={0.75} color="#7dd3fc" />

      {/* Rim / fill accents tailored to key stations */}
      <pointLight position={[0, 4.5, 2.5]} intensity={14} distance={14} decay={2} color="#38bdf8" />
      <pointLight position={[12.5, 4.2, -0.5]} intensity={18} distance={14} decay={2} color="#10b981" />
      <pointLight position={[16.2, 3.8, -0.2]} intensity={14} distance={12} decay={2} color="#22d3ee" />
      <pointLight position={[-14, 4.2, 0.5]} intensity={14} distance={14} decay={2} color="#818cf8" />
      <pointLight position={[7, 4.2, -11.5]} intensity={14} distance={14} decay={2} color="#22d3ee" />
      <pointLight position={[-7, 4.2, -11.5]} intensity={14} distance={14} decay={2} color="#f59e0b" />
    </>
  );
}
