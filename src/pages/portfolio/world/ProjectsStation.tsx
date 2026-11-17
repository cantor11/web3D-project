import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function ProjectsStation() {
  const station = getStationById('proyectos');
  const locale = usePortfolioStore((s) => s.locale);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (haloRef.current) {
      haloRef.current.rotation.y -= delta * 0.55;
      haloRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group name="station-proyectos" position={station.position}>
      <InteractiveNode nodeId="projects-web3d">
        <GlbModel url="/models-3d/projects-stage.glb" />
      </InteractiveNode>

      <InteractiveNode nodeId="projects-data" position={[0.9, 1.1, -0.1]}>
        <mesh ref={haloRef}>
          <torusKnotGeometry args={[0.24, 0.04, 48, 8]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#10b981"
            emissiveIntensity={1.1}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
      </InteractiveNode>

      <Text
        position={[0, 2.45, 0]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.18}
        color="#67e8f9"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.014}
        outlineColor="#090d16"
      >
        {locale === 'es' ? '04 // PROYECTOS & PIPELINE 3D' : '04 // PROJECTS & 3D PIPELINE'}
      </Text>
    </group>
  );
}
