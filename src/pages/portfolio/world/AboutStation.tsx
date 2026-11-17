import { useRef } from 'react';
import * as THREE from 'three';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function AboutStation() {
  const station = getStationById('sobre-mi');
  const locale = usePortfolioStore((s) => s.locale);
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (orbRef.current) {
      orbRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <group name="station-sobre-mi" position={station.position}>
      <InteractiveNode nodeId="workstation-hero">
        <GlbModel url="/models-3d/workstation.glb" />
      </InteractiveNode>

      {/* Non-interactive floating holographic marker (Layer 0) */}
      <Float speed={1.8} floatIntensity={0.22} rotationIntensity={0.2}>
        <mesh ref={orbRef} position={[1.45, 2.15, -0.35]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.25}
            wireframe
          />
        </mesh>
      </Float>

      <Text
        position={[0, 2.08, -0.35]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.18}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#090d16"
      >
        {locale === 'es' ? '01 // JUNIOR CANTOR · ING. SISTEMAS' : '01 // JUNIOR CANTOR · SYSTEMS ENG.'}
      </Text>
    </group>
  );
}
