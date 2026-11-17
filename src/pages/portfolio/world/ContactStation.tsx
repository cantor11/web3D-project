import { useRef } from 'react';
import * as THREE from 'three';
import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function ContactStation() {
  const station = getStationById('contacto');
  const locale = usePortfolioStore((s) => s.locale);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (pulseRingRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.14;
      pulseRingRef.current.scale.setScalar(s);
    }
  });

  return (
    <group name="station-contacto" position={station.position}>
      <InteractiveNode nodeId="contact-terminal">
        <GlbModel url="/models-3d/contact-beacon.glb" />
      </InteractiveNode>

      <Float speed={1.4} floatIntensity={0.1}>
        <mesh ref={pulseRingRef} position={[0.58, 2.34, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.015, 8, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={1.4}
          />
        </mesh>
      </Float>

      <Text
        position={[0, 2.7, 0]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.18}
        color="#fcd34d"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.014}
        outlineColor="#090d16"
      >
        {locale === 'es' ? '05 // CONTACTO & HOJA DE VIDA' : '05 // CONTACT & RESUME'}
      </Text>
    </group>
  );
}
