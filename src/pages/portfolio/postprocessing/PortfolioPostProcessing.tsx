import { Bloom, EffectComposer, Outline, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function PortfolioPostProcessing() {
  const isDark = usePortfolioStore((s) => s.theme === 'dark');
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);

  if (qualityPreset === 'performance') {
    return null;
  }

  if (qualityPreset === 'balanced') {
    return (
      <EffectComposer key="balanced" multisampling={0}>
        <SMAA />
        <Outline
          blur
          edgeStrength={3.4}
          pulseSpeed={0}
          visibleEdgeColor={isDark ? 0xeb8647 : 0xb84a14}
          hiddenEdgeColor={isDark ? 0x8a4b25 : 0x7a310d}
          width={520}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer key="ultra" multisampling={0}>
      <SMAA />
      <Outline
        blur
        edgeStrength={3.8}
        pulseSpeed={0}
        visibleEdgeColor={isDark ? 0xeb8647 : 0xb84a14}
        hiddenEdgeColor={isDark ? 0x8a4b25 : 0x7a310d}
        width={620}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={1.55}
        luminanceSmoothing={0.28}
        intensity={0.12}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
