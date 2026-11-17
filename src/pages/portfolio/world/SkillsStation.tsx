import { Text } from '@react-three/drei';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function SkillsStation() {
  const station = getStationById('habilidades');
  const locale = usePortfolioStore((s) => s.locale);
  const isDark = usePortfolioStore((s) => s.theme === 'dark');

  return (
    <group name="station-habilidades" position={station.position}>
      <InteractiveNode nodeId="skills-core">
        <GlbModel url="/models-3d/skills-hub.glb" />
      </InteractiveNode>

      {/* Interactive brass archival crown for Academic Record & Certifications */}
      <InteractiveNode nodeId="certifications-totem" position={[0, 2.27, -0.05]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.31, 0.14, 8]} />
          <meshStandardMaterial color="#d47b45" metalness={0.82} roughness={0.3} />
        </mesh>
      </InteractiveNode>

      <Text
        position={[0, 2.66, -0.05]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.15}
        color={isDark ? '#f3efe6' : '#161513'}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'Stack y Certificaciones' : 'Engineering Stack & Certs'}
      </Text>
    </group>
  );
}
