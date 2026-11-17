import { Text } from '@react-three/drei';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function ContactStation() {
  const station = getStationById('contacto');
  const locale = usePortfolioStore((s) => s.locale);
  const isDark = usePortfolioStore((s) => s.theme === 'dark');

  return (
    <group name="station-contacto" position={station.position}>
      <InteractiveNode nodeId="contact-terminal">
        <GlbModel url="/models-3d/contact-beacon.glb" />
      </InteractiveNode>

      <Text
        position={[0, 2.66, 0]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.15}
        color={isDark ? '#f3efe6' : '#161513'}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'Contacto y Hoja de Vida' : 'Contact & Resume'}
      </Text>
    </group>
  );
}
