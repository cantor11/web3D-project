import { useGLTF } from '@react-three/drei';

export const DRACO_DECODER_PATH = '/draco/';

export function preloadPortfolioModels(): void {
  useGLTF.setDecoderPath(DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/workstation.glb', DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/uplanner-datacenter.glb', DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/gss-mobile.glb', DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/skills-hub.glb', DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/projects-stage.glb', DRACO_DECODER_PATH);
  useGLTF.preload('/models-3d/contact-beacon.glb', DRACO_DECODER_PATH);
}
