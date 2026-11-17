import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { Select } from '@react-three/postprocessing';
import type { InteractiveNodeId } from '@/data/portfolioData';
import { useInteractiveLayer } from '@/hooks/useInteractiveLayer';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

interface InteractiveNodeProps {
  nodeId: InteractiveNodeId;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
}

const SCALE_DEFAULT = 1;
const SCALE_HOVER = 1.045;
const LIFT_HOVER = 0.042;
const DRAG_THRESHOLD_PX = 6;

export function InteractiveNode({
  nodeId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
}: InteractiveNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const baseY = position[1];

  const isHovered = usePortfolioStore((s) => s.hoveredNodeId === nodeId);
  const isSelected = usePortfolioStore((s) => s.selectedNodeId === nodeId);
  const setHoveredNode = usePortfolioStore((s) => s.setHoveredNode);
  const selectNode = usePortfolioStore((s) => s.selectNode);
  const setRaycastTimeMs = usePortfolioStore((s) => s.setRaycastTimeMs);

  useInteractiveLayer(groupRef, true);

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto';
    return () => {
      if (usePortfolioStore.getState().hoveredNodeId === null) {
        document.body.style.cursor = 'auto';
      }
    };
  }, [isHovered]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const active = isHovered || isSelected;
    const targetScale = active ? SCALE_HOVER : SCALE_DEFAULT;
    const targetY = active ? baseY + LIFT_HOVER : baseY;
    const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, 11, delta);
    const nextY = THREE.MathUtils.damp(group.position.y, targetY, 11, delta);
    group.scale.setScalar(nextScale);
    group.position.y = nextY;
  });

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    const start = performance.now();
    e.stopPropagation();
    setHoveredNode(nodeId);
    setRaycastTimeMs(Number((performance.now() - start).toFixed(3)));
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (usePortfolioStore.getState().hoveredNodeId === nodeId) {
      setHoveredNode(null);
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const down = pointerDownPos.current;
    pointerDownPos.current = null;
    if (!down) return;
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) {
      selectNode(nodeId);
    }
  };

  return (
    <Select enabled={isHovered || isSelected}>
      <group
        ref={groupRef}
        name={`interactive-${nodeId}`}
        position={position}
        rotation={rotation}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {children}
      </group>
    </Select>
  );
}
