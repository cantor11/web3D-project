import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { DRACO_DECODER_PATH } from '@/components/canvas/modelPreload';
import { INTERACTIVE_LAYER } from '@/hooks/useInteractiveLayer';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { withBase } from '@/utils/assetUrl';

useGLTF.setDecoderPath(DRACO_DECODER_PATH);

interface GlbModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  interactive?: boolean;
}

export function GlbModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  interactive = true,
}: GlbModelProps) {
  const resolvedUrl = withBase(url);
  const gltf = useGLTF(resolvedUrl, DRACO_DECODER_PATH);
  const setDracoInitMs = usePortfolioStore((s) => s.setDracoInitMs);

  const clonedScene = useMemo(() => {
    const decodeStart = performance.now();
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (interactive) {
        child.layers.enable(INTERACTIVE_LAYER);
      }
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
    const decodeMs = Math.max(1, Math.round(performance.now() - decodeStart));
    return { clone, decodeMs };
  }, [gltf.scene, castShadow, receiveShadow, interactive]);

  useEffect(() => {
    if (usePortfolioStore.getState().dracoInitMs === null) {
      setDracoInitMs(clonedScene.decodeMs);
    }
  }, [clonedScene.decodeMs, setDracoInitMs]);

  return (
    <primitive
      object={clonedScene.clone}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    />
  );
}
