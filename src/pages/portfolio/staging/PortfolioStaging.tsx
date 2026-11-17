import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import { STATIONS } from '@/data/portfolioData';
import blueprintVert from '@/shaders/blueprintGrid.vert';
import blueprintFrag from '@/shaders/blueprintGrid.frag';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

const CAMPUS_HUB: [number, number, number] = [0, 0.012, 0];

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
    const markerCount = 12;
    const markers: [number, number, number][] = [];

    for (let i = 1; i < markerCount; i++) {
      const t = i / markerCount;
      markers.push([CAMPUS_HUB[0] + dx * t, 0.014, CAMPUS_HUB[2] + dz * t]);
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
  const theme = usePortfolioStore((s) => s.theme);
  const gridMatRef = useRef<THREE.ShaderMaterial>(null);

  const isDark = theme === 'dark';
  const stageBg = isDark ? '#11100e' : '#eae5da';

  const gridUniforms = useMemo(
    () => ({
      uGridColor: { value: new THREE.Color('#23201b') },
      uMajorColor: { value: new THREE.Color('#423c33') },
      uBackgroundColor: { value: new THREE.Color('#11100e') },
      uCellSize: { value: 1.0 },
      uMajorStep: { value: 4.0 },
      uFadeDistance: { value: 42.0 },
    }),
    [],
  );

  useEffect(() => {
    gridUniforms.uBackgroundColor.value.set(isDark ? '#11100e' : '#eae5da');
    gridUniforms.uGridColor.value.set(isDark ? '#23201b' : '#d6cfc0');
    gridUniforms.uMajorColor.value.set(isDark ? '#423c33' : '#afa796');
  }, [isDark, gridUniforms]);

  const connectors = useMemo(() => buildConnectorSegments(), []);

  // Architectural stone perimeter markers (Layer 0)
  const perimeterMarkers = useMemo(() => {
    const items: { key: string; pos: [number, number, number]; height: number }[] = [];
    const total = 32;
    for (let i = 0; i < total; i++) {
      const theta = (i / total) * Math.PI * 2;
      const radius = 24.5;
      items.push({
        key: `pylon-${i}`,
        pos: [Math.cos(theta) * radius, 0.16, Math.sin(theta) * radius - 5],
        height: i % 4 === 0 ? 0.34 : 0.18,
      });
    }
    return items;
  }, []);

  const copperTrackColor = isDark ? '#9a5833' : '#a85a2e';
  const brassPinColor = isDark ? '#c47b49' : '#8c4f2b';
  const stoneBollardColor = isDark ? '#24221e' : '#cbc4b5';

  return (
    <>
      <color attach="background" args={[stageBg]} />
      <fog attach="fog" args={[stageBg, 24, 58]} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={isDark ? 1.85 : 2.15}
          color="#fff4e4"
          position={[4, 12, 10]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[18, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.35}
          color="#dfe5ed"
          position={[-12, 7, -4]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[12, 4, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.1}
          color="#edd9c4"
          position={[10, 6, -8]}
          rotation={[Math.PI / 4, -Math.PI / 4, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>

      {/* Architectural Matte Drafting Floor (Layer 0) */}
      <mesh position={[0, 0, -5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[120, 120]} />
        <shaderMaterial
          ref={gridMatRef}
          vertexShader={blueprintVert}
          fragmentShader={blueprintFrag}
          uniforms={gridUniforms}
        />
      </mesh>

      {/* Transparent Shadow Catcher */}
      <mesh position={[0, 0.004, -5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <shadowMaterial transparent opacity={isDark ? 0.42 : 0.24} />
      </mesh>

      {/* Brushed Copper Inlay Tracks & Stone Markers (Layer 0) */}
      <group name="campus-architecture-layer0">
        {connectors.map((seg) => (
          <group key={seg.id}>
            <mesh position={[seg.midX, 0.007, seg.midZ]} rotation={[0, seg.angle, 0]}>
              <boxGeometry args={[0.06, 0.008, seg.length]} />
              <meshStandardMaterial color={copperTrackColor} metalness={0.78} roughness={0.36} />
            </mesh>
            {seg.markers.map((pos, idx) => (
              <mesh key={`${seg.id}-m-${idx}`} position={pos}>
                <boxGeometry args={[0.1, 0.016, 0.1]} />
                <meshStandardMaterial color={brassPinColor} metalness={0.72} roughness={0.38} />
              </mesh>
            ))}
          </group>
        ))}

        {perimeterMarkers.map((item) => (
          <mesh key={item.key} position={item.pos}>
            <boxGeometry args={[0.18, item.height, 0.18]} />
            <meshStandardMaterial color={stoneBollardColor} metalness={0.12} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </>
  );
}
