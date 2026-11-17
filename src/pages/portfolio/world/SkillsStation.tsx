import { useRef } from 'react';
import * as THREE from 'three';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function SkillsStation() {
  const station = getStationById('habilidades');
  const locale = usePortfolioStore((s) => s.locale);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.45;
    }
  });

  return (
    <group name="station-habilidades" position={station.position}>
      <InteractiveNode nodeId="skills-core">
        <GlbModel url="/models-3d/skills-hub.glb" />
      </InteractiveNode>

      {/* Secondary clickable node for Certifications */}
      <InteractiveNode nodeId="certifications-totem" position={[0, 1.3, 0]}>
        <Float speed={1.5} floatIntensity={0.14}>
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.72, 0.032, 10, 32]} />
            <meshStandardMaterial
              color="#818cf8"
              emissive="#818cf8"
              emissiveIntensity={1.15}
              metalness={0.5}
              roughness={0.25}
            />
          </mesh>
        </Float>
      </InteractiveNode>

      <Text
        position={[0, 2.65, -0.05]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.18}
        color="#c7d2fe"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.014}
        outlineColor="#090d16"
      >
        {locale === 'es' ? '03 // STACK & CERTIFICACIONES' : '03 // TECH STACK & CERTS'}
      </Text>
    </group>
  );
}
