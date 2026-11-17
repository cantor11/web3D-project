import { Text } from '@react-three/drei';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function ProjectsStation() {
  const station = getStationById('proyectos');
  const locale = usePortfolioStore((s) => s.locale);
  const isDark = usePortfolioStore((s) => s.theme === 'dark');

  return (
    <group name="station-proyectos" position={station.position}>
      <InteractiveNode nodeId="projects-web3d">
        <GlbModel url="/models-3d/projects-stage.glb" />
      </InteractiveNode>

      {/* Interactive collar over the right-side Data & Backend manifold */}
      <InteractiveNode nodeId="projects-data" position={[0.88, 1.18, -0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.3, 0.42]} />
          <meshStandardMaterial color="#4e9a76" metalness={0.55} roughness={0.34} />
        </mesh>
      </InteractiveNode>

      <Text
        position={[0, 2.38, 0]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.15}
        color={isDark ? '#f3efe6' : '#161513'}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'Proyectos Web 3D y Datos' : 'Web 3D & Data Projects'}
      </Text>
    </group>
  );
}
