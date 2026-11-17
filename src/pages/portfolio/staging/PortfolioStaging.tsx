import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { STATIONS } from '@/data/portfolioData';
import blueprintVert from '@/shaders/blueprintGrid.vert';
import blueprintFrag from '@/shaders/blueprintGrid.frag';

const CAMPUS_HUB: [number, number, number] = [0, 0.015, 0];

interface ConnectorSegment {
  id: string;
  length: number;
  midX: number;
  midZ: number;
  angle: number;
  markers: [number, number, number][];
}

function buildConnectorSegments(): ConnectorSegment[] {
  return STATIONS.slice(1).map((station) => {
    const dx = station.position[0] - CAMPUS_HUB[0];
    const dz = station.position[2] - CAMPUS_HUB[2];
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const markerCount = 14;
    const markers: [number, number, number][] = [];

    for (let i = 1; i < markerCount; i++) {
      const t = i / markerCount;
      markers.push([
        CAMPUS_HUB[0] + dx * t,
        0.02,
        CAMPUS_HUB[2] + dz * t,
      ]);
    }

    return {
      id: station.id,
      length,
      midX: CAMPUS_HUB[0] + dx * 0.5,
      midZ: CAMPUS_HUB[2] + dz * 0.5,
      angle,
      markers,
    };
  });
}

export function PortfolioStaging() {
  const gridMatRef = useRef<THREE.ShaderMaterial>(null);

  const gridUniforms = useMemo(
    () => ({
      uGridColor: { value: new THREE.Color('#164e63') },
      uMajorColor: { value: new THREE.Color('#22d3ee') },
      uBackgroundColor: { value: new THREE.Color('#090d16') },
      uCellSize: { value: 1.0 },
      uMajorStep: { value: 4.0 },
      uFadeDistance: { value: 44.0 },
    }),
    [],
  );

  const connectors = useMemo(() => buildConnectorSegments(), []);

  // Perimeter structural pylons (non-interactive layer 0) to establish architectural scale & >80 scene geometries
  const perimeterMarkers = useMemo(() => {
    const items: { key: string; pos: [number, number, number]; height: number }[] = [];
    const total = 36;
    for (let i = 0; i < total; i++) {
      const theta = (i / total) * Math.PI * 2;
      const radius = 24.5;
      items.push({
        key: `pylon-${i}`,
        pos: [Math.cos(theta) * radius, 0.25, Math.sin(theta) * radius - 5],
        height: i % 3 === 0 ? 0.5 : 0.24,
      });
    }
    return items;
  }, []);

  useFrame(() => {
    // Keep uniform object reference stable without triggering React updates
    if (gridMatRef.current) {
      gridMatRef.current.uniforms.uFadeDistance.value = 44.0;
    }
  });

  return (
    <>
      <color attach="background" args={['#090d16']} />
      <fog attach="fog" args={['#090d16', 24, 58]} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#38bdf8"
          position={[0, 10, 8]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[16, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#e2e8f0"
          position={[12, 6, -6]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[10, 3, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.8}
          color="#10b981"
          position={[-10, 7, -4]}
          rotation={[Math.PI / 4, Math.PI / 4, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>

      {/* GLSL Technical Blueprint Floor (Layer 0) */}
      <mesh position={[0, 0, -5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[120, 120]} />
        <shaderMaterial
          ref={gridMatRef}
          vertexShader={blueprintVert}
          fragmentShader={blueprintFrag}
          uniforms={gridUniforms}
          transparent
        />
      </mesh>

      {/* Transparent Shadow Catcher over GLSL Grid */}
      <mesh position={[0, 0.004, -5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <shadowMaterial transparent opacity={0.42} />
      </mesh>

      {/* Campus Navigation Tracks & Markers (Layer 0, skipped by interactive Raycaster) */}
      <group name="campus-architecture-layer0">
        {connectors.map((seg) => (
          <group key={seg.id}>
            <mesh
              position={[seg.midX, 0.008, seg.midZ]}
              rotation={[0, seg.angle, 0]}
            >
              <boxGeometry args={[0.08, 0.01, seg.length]} />
              <meshStandardMaterial
                color="#0e7490"
                emissive="#22d3ee"
                emissiveIntensity={0.45}
                roughness={0.4}
              />
            </mesh>
            {seg.markers.map((pos, idx) => (
              <mesh key={`${seg.id}-m-${idx}`} position={pos}>
                <boxGeometry args={[0.14, 0.025, 0.14]} />
                <meshStandardMaterial
                  color="#164e63"
                  emissive="#22d3ee"
                  emissiveIntensity={idx % 2 === 0 ? 0.6 : 0.25}
                />
              </mesh>
            ))}
          </group>
        ))}

        {perimeterMarkers.map((item) => (
          <mesh key={item.key} position={item.pos}>
            <boxGeometry args={[0.16, item.height, 0.16]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive="#1e3a5f"
              emissiveIntensity={0.45}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>

      <Sparkles
        count={70}
        scale={[34, 7, 28]}
        position={[0, 3.2, -5]}
        size={1.6}
        speed={0.22}
        opacity={0.45}
        color="#38bdf8"
      />
    </>
  );
}
