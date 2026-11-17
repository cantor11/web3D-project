import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';

/**
 * Layer 0 remains the default render layer for the camera.
 * Layer 1 isolates interactive meshes so the Raycaster skips decorative geometry.
 */
export const INTERACTIVE_LAYER = 1;

/**
 * Registers every Mesh inside a group onto INTERACTIVE_LAYER while preserving
 * layer 0 visibility for rendering, and enables consistent shadow flags.
 */
export function useInteractiveLayer(
  groupRef: RefObject<THREE.Group | null>,
  enabled = true,
): void {
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.traverse((obj) => {
      if (enabled) {
        obj.layers.enable(INTERACTIVE_LAYER);
      } else {
        obj.layers.disable(INTERACTIVE_LAYER);
      }
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [groupRef, enabled]);
}
