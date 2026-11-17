import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, useTexture } from '@react-three/drei';
import { STATIONS } from '@/data/portfolioData';
import blueprintVert from '@/shaders/blueprintGrid.vert';
import blueprintFrag from '@/shaders/blueprintGrid.frag';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

const CAMPUS_HUB: [number, number, number] = [0, 0.012, 0];
const CUBEMAP_FILES = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];

function freezeMatrix(obj: THREE.Object3D) {
  obj.updateMatrix();
  obj.matrixAutoUpdate = false;
}

interface ConnectorSegment {
  id: string;
  length: number;
  midX: number;
  midZ: number;
  angle: number;
  markers: [number, number, number][];
}

function buildConnectorSegments(): ConnectorSegment[] {
  return STATIONS.slice(1).map((station) => {
    const dx = station.position[0] - CAMPUS_HUB[0];
    const dz = station.position[2] - CAMPUS_HUB[2];
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const markerCount = 12;
    const markers: [number, number, number][] = [];

    for (let i = 1; i < markerCount; i++) {
      const t = i / markerCount;
      markers.push([CAMPUS_HUB[0] + dx * t, 0.02, CAMPUS_HUB[2] + dz * t]);
    }

    return {
      id: station.id,
      length,
      midX: CAMPUS_HUB[0] + dx * 0.5,
      midZ: CAMPUS_HUB[2] + dz * 0.5,
      angle,
      markers,
    };
  });
}

export function PortfolioStaging() {
  const theme = usePortfolioStore((s) => s.theme);
  const qualityPreset = usePortfolioStore((s) => s.qualityPreset);
  const gridMatRef = useRef<THREE.ShaderMaterial>(null);
  const brassInstancesRef = useRef<THREE.InstancedMesh>(null);
  const stoneInstancesRef = useRef<THREE.InstancedMesh>(null);

  const isDark = theme === 'dark';
  const stageBg = isDark ? '#11100e' : '#eae5da';

  const stoneTextures = useTexture({
    map: '/textures/pbr/stone-albedo.webp',
    normalMap: '/textures/pbr/stone-normal.webp',
    roughnessMap: '/textures/pbr/stone-roughness.webp',
    aoMap: '/textures/pbr/stone-ao.webp',
  });

  useMemo(() => {
    stoneTextures.map.colorSpace = THREE.SRGBColorSpace;
    const maps = [
      stoneTextures.map,
      stoneTextures.normalMap,
      stoneTextures.roughnessMap,
      stoneTextures.aoMap,
    ];
    for (const tex of maps) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      tex.needsUpdate = true;
    }
  }, [stoneTextures]);

  const gridUniforms = useMemo(
    () => ({
      uGridColor: { value: new THREE.Color('#23201b') },
      uMajorColor: { value: new THREE.Color('#423c33') },
      uBackgroundColor: { value: new THREE.Color('#11100e') },
      uCellSize: { value: 1.0 },
      uMajorStep: { value: 4.0 },
      uFadeDistance: { value: 42.0 },
    }),
    [],
  );

  useEffect(() => {
    gridUniforms.uBackgroundColor.value.set(isDark ? '#11100e' : '#eae5da');
    gridUniforms.uGridColor.value.set(isDark ? '#23201b' : '#d6cfc0');
    gridUniforms.uMajorColor.value.set(isDark ? '#423c33' : '#afa796');
  }, [isDark, gridUniforms]);

  const connectors = useMemo(() => buildConnectorSegments(), []);

  // Instanced transforms for brass pins + major perimeter bollards and stone perimeter bollards
  const { brassTransforms, stoneTransforms } = useMemo(() => {
    const brass: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    const stone: { pos: [number, number, number]; scale: [number, number, number] }[] = [];

    for (const seg of connectors) {
      for (const pos of seg.markers) {
        brass.push({ pos, scale: [0.1, 0.016, 0.1] });
      }
    }

    const total = 32;
    for (let i = 0; i < total; i++) {
      const theta = (i / total) * Math.PI * 2;
      const radius = 24.5;
      const isMajor = i % 4 === 0;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius - 5;
      if (isMajor) {
        brass.push({ pos: [x, 0.22, z], scale: [0.18, 0.44, 0.18] });
      } else {
        stone.push({ pos: [x, 0.12, z], scale: [0.18, 0.22, 0.18] });
      }
    }

    return { brassTransforms: brass, stoneTransforms: stone };
  }, [connectors]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (brassInstancesRef.current) {
      brassTransforms.forEach((item, idx) => {
        dummy.position.set(...item.pos);
        dummy.scale.set(...item.scale);
        dummy.updateMatrix();
        brassInstancesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      brassInstancesRef.current.instanceMatrix.needsUpdate = true;
      brassInstancesRef.current.computeBoundingSphere();
      freezeMatrix(brassInstancesRef.current);
    }

    if (stoneInstancesRef.current) {
      stoneTransforms.forEach((item, idx) => {
        dummy.position.set(...item.pos);
        dummy.scale.set(...item.scale);
        dummy.updateMatrix();
        stoneInstancesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      stoneInstancesRef.current.instanceMatrix.needsUpdate = true;
      stoneInstancesRef.current.computeBoundingSphere();
      freezeMatrix(stoneInstancesRef.current);
    }
  }, [brassTransforms, stoneTransforms]);

  const copperTrackColor = isDark ? '#9a5833' : '#a85a2e';
  const brassPinColor = isDark ? '#c47b49' : '#8c4f2b';
  const stoneTintColor = isDark ? '#3a3630' : '#f2ede3';
  const stoneBollardColor = isDark ? '#24221e' : '#cbc4b5';

  return (
    <>
      <color attach="background" args={[stageBg]} />
      <fog attach="fog" args={[stageBg, 24, 58]} />

      {/* 6-Face Architectural Studio Cubemap IBL (Skyshield staging pattern) */}
      <Environment
        files={CUBEMAP_FILES}
        path="/cubemap/studio/"
        background={false}
        environmentIntensity={isDark ? 0.92 : 1.12}
      />

      {/* Architectural Matte Drafting Floor (Layer 0) */}
      <mesh
        position={[0, 0, -5]}
        rotation-x={-Math.PI / 2}
        onUpdate={freezeMatrix}
      >
        <planeGeometry args={[120, 120]} />
        <shaderMaterial
          ref={gridMatRef}
          vertexShader={blueprintVert}
          fragmentShader={blueprintFrag}
          uniforms={gridUniforms}
        />
      </mesh>

      {/* Transparent Shadow Catcher */}
      {qualityPreset !== 'performance' && (
        <mesh
          position={[0, 0.004, -5]}
          rotation-x={-Math.PI / 2}
          receiveShadow
          onUpdate={freezeMatrix}
        >
          <planeGeometry args={[90, 90]} />
          <shadowMaterial transparent opacity={isDark ? 0.42 : 0.24} />
        </mesh>
      )}

      {/* Honed Stone PBR Walkways, Station Plazas, Copper Datum Rings & Instanced Markers (Layer 0) */}
      <group name="campus-architecture-layer0">
        {STATIONS.map((station) => {
          const isExperience = station.id === 'experiencia';
          const plazaRadius = isExperience ? 4.4 : 3.25;
          const plazaCenterX = isExperience ? 14.2 : station.position[0];
          const plazaCenterZ = station.position[2];

          return (
            <group key={`plaza-${station.id}`}>
              {/* Honed Stone PBR Circular Station Pad */}
              <mesh
                position={[plazaCenterX, 0.006, plazaCenterZ]}
                receiveShadow={qualityPreset !== 'performance'}
                onUpdate={freezeMatrix}
              >
                <cylinderGeometry args={[plazaRadius, plazaRadius + 0.08, 0.012, 32]} />
                <meshStandardMaterial
                  map={stoneTextures.map}
                  normalMap={stoneTextures.normalMap}
                  normalScale={new THREE.Vector2(0.35, 0.35)}
                  roughnessMap={stoneTextures.roughnessMap}
                  aoMap={stoneTextures.aoMap}
                  aoMapIntensity={0.65}
                  color={stoneTintColor}
                  roughness={0.86}
                  metalness={0.08}
                />
              </mesh>

              {/* Outer Brushed Copper Datum Ring */}
              <mesh
                position={[plazaCenterX, 0.013, plazaCenterZ]}
                rotation-x={-Math.PI / 2}
                onUpdate={freezeMatrix}
              >
                <ringGeometry args={[plazaRadius + 0.14, plazaRadius + 0.2, 48]} />
                <meshStandardMaterial
                  color={copperTrackColor}
                  metalness={0.8}
                  roughness={0.32}
                />
              </mesh>
            </group>
          );
        })}

        {connectors.map((seg) => (
          <group key={seg.id}>
            {/* Honed Stone PBR Walkway Slab */}
            <mesh
              position={[seg.midX, 0.005, seg.midZ]}
              rotation={[0, seg.angle, 0]}
              receiveShadow={qualityPreset !== 'performance'}
              onUpdate={freezeMatrix}
            >
              <boxGeometry args={[0.78, 0.01, seg.length]} />
              <meshStandardMaterial
                map={stoneTextures.map}
                normalMap={stoneTextures.normalMap}
                normalScale={new THREE.Vector2(0.3, 0.3)}
                roughnessMap={stoneTextures.roughnessMap}
                aoMap={stoneTextures.aoMap}
                color={stoneTintColor}
                roughness={0.88}
                metalness={0.08}
              />
            </mesh>

            {/* Center Brushed Copper Inlay Track */}
            <mesh
              position={[seg.midX, 0.012, seg.midZ]}
              rotation={[0, seg.angle, 0]}
              onUpdate={freezeMatrix}
            >
              <boxGeometry args={[0.06, 0.008, seg.length]} />
              <meshStandardMaterial
                color={copperTrackColor}
                metalness={0.8}
                roughness={0.34}
              />
            </mesh>
          </group>
        ))}

        {/* Outer Architectural Datum Ring */}
        <mesh
          position={[0, 0.008, -5]}
          rotation-x={-Math.PI / 2}
          onUpdate={freezeMatrix}
        >
          <ringGeometry args={[24.42, 24.58, 64]} />
          <meshStandardMaterial
            color={copperTrackColor}
            metalness={0.76}
            roughness={0.38}
          />
        </mesh>

        {/* GPU-Instanced Brass Survey Pins & Major Perimeter Bollards (52 instances -> 1 draw call) */}
        <instancedMesh
          ref={brassInstancesRef}
          args={[undefined, undefined, brassTransforms.length]}
          frustumCulled={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={brassPinColor}
            metalness={0.72}
            roughness={0.36}
          />
        </instancedMesh>

        {/* GPU-Instanced Stone Perimeter Bollards (24 instances -> 1 draw call) */}
        <instancedMesh
          ref={stoneInstancesRef}
          args={[undefined, undefined, stoneTransforms.length]}
          frustumCulled={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={stoneBollardColor}
            metalness={0.14}
            roughness={0.85}
          />
        </instancedMesh>
      </group>
    </>
  );
}

useTexture.preload('/textures/pbr/stone-albedo.webp');
useTexture.preload('/textures/pbr/stone-normal.webp');
useTexture.preload('/textures/pbr/stone-roughness.webp');
useTexture.preload('/textures/pbr/stone-ao.webp');
