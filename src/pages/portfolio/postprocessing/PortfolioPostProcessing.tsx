import { Bloom, EffectComposer, Outline, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function PortfolioPostProcessing() {
  return (
    <EffectComposer multisampling={0} autoClear={false}>
      <SMAA />
      <Outline
        blur
        edgeStrength={4.2}
        pulseSpeed={0}
        visibleEdgeColor={0x22d3ee}
        hiddenEdgeColor={0x0891b2}
        width={650}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={1.08}
        luminanceSmoothing={0.4}
        intensity={0.35}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
