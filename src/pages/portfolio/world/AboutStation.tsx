import { Text } from '@react-three/drei';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function AboutStation() {
  const station = getStationById('sobre-mi');
  const locale = usePortfolioStore((s) => s.locale);
  const isDark = usePortfolioStore((s) => s.theme === 'dark');

  return (
    <group name="station-sobre-mi" position={station.position}>
      <InteractiveNode nodeId="workstation-hero">
        <GlbModel url="/models-3d/workstation.glb" />
      </InteractiveNode>

      <Text
        position={[0, 2.08, -0.25]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.15}
        color={isDark ? '#f3efe6' : '#161513'}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'Junior Cantor · Sistemas y Datos' : 'Junior Cantor · Systems & Data'}
      </Text>
    </group>
  );
}
