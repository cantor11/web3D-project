import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import etlPulseFrag from '@/shaders/etlPulse.frag';
import etlPulseVert from '@/shaders/etlPulse.vert';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function ExperienceDiorama() {
  const station = getStationById('experiencia');
  const locale = usePortfolioStore((s) => s.locale);
  const selectNode = usePortfolioStore((s) => s.selectNode);

  const pulseMatPrimary = useRef<THREE.ShaderMaterial>(null);
  const pulseMatSecondary = useRef<THREE.ShaderMaterial>(null);
  const pulseMatTertiary = useRef<THREE.ShaderMaterial>(null);

  const primaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#064e3b') },
      uPulseColor: { value: new THREE.Color('#10b981') },
      uSpeed: { value: 0.72 },
      uDensity: { value: 3.0 },
    }),
    [],
  );

  const secondaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#164e63') },
      uPulseColor: { value: new THREE.Color('#22d3ee') },
      uSpeed: { value: 0.95 },
      uDensity: { value: 2.5 },
    }),
    [],
  );

  const tertiaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#164e63') },
      uPulseColor: { value: new THREE.Color('#38bdf8') },
      uSpeed: { value: 0.82 },
      uDensity: { value: 2.8 },
    }),
    [],
  );

  // Curved fiber conduits connecting the Uplanner ETL audit terminal and datacenter rack
  const conduits = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.58, 1.15, 0.52),
      new THREE.Vector3(-2.2, 0.42, 0.72),
      new THREE.Vector3(-1.7, 0.36, 0.45),
      new THREE.Vector3(-1.45, 1.05, 0.25),
    ]);
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.58, 1.32, 0.45),
      new THREE.Vector3(-2.15, 1.85, 0.25),
      new THREE.Vector3(-1.65, 1.98, 0.05),
      new THREE.Vector3(-1.45, 1.85, -0.05),
    ]);
    const c3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.75, 0.9, 0.1),
      new THREE.Vector3(0.45, 0.28, 0.35),
      new THREE.Vector3(1.55, 0.42, 0.35),
      new THREE.Vector3(2.15, 1.05, 0.35),
    ]);
    return {
      tube1: new THREE.TubeGeometry(c1, 40, 0.026, 8, false),
      tube2: new THREE.TubeGeometry(c2, 40, 0.024, 8, false),
      tube3: new THREE.TubeGeometry(c3, 40, 0.022, 8, false),
    };
  }, []);

  useEffect(() => {
    return () => {
      conduits.tube1.dispose();
      conduits.tube2.dispose();
      conduits.tube3.dispose();
    };
  }, [conduits]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pulseMatPrimary.current) pulseMatPrimary.current.uniforms.uTime.value = t;
    if (pulseMatSecondary.current) pulseMatSecondary.current.uniforms.uTime.value = t;
    if (pulseMatTertiary.current) pulseMatTertiary.current.uniforms.uTime.value = t;
  });

  return (
    <group name="station-experiencia" position={station.position}>
      {/* Uplanner Datacenter Rack + Audit Terminal */}
      <InteractiveNode nodeId="uplanner-rack" position={[-1.45, 0, -0.1]}>
        <GlbModel url="/models-3d/uplanner-datacenter.glb" />
      </InteractiveNode>

      {/* Global System Solutions Mobile + REST Nodes */}
      <InteractiveNode nodeId="gss-mobile" position={[2.15, 0, 0.35]}>
        <GlbModel url="/models-3d/gss-mobile.glb" />
      </InteractiveNode>

      {/* Procedural GLSL ETL Pulse Conduits (Layer 0) */}
      <group name="etl-fiber-conduits">
        <mesh geometry={conduits.tube1}>
          <shaderMaterial
            ref={pulseMatPrimary}
            vertexShader={etlPulseVert}
            fragmentShader={etlPulseFrag}
            uniforms={primaryUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={conduits.tube2}>
          <shaderMaterial
            ref={pulseMatSecondary}
            vertexShader={etlPulseVert}
            fragmentShader={etlPulseFrag}
            uniforms={secondaryUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={conduits.tube3}>
          <shaderMaterial
            ref={pulseMatTertiary}
            vertexShader={etlPulseVert}
            fragmentShader={etlPulseFrag}
            uniforms={tertiaryUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      <Text
        position={[-1.45, 2.85, -0.25]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.18}
        color="#34d399"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.014}
        outlineColor="#090d16"
      >
        UPLANNER · AIRFLOW + POLARS
      </Text>

      <Text
        position={[2.15, 2.85, 0.35]}
        font="/fonts/Roboto-Bold.ttf"
        fontSize={0.17}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.014}
        outlineColor="#090d16"
      >
        GLOBAL SYSTEM SOLUTIONS · REST
      </Text>

      <Html
        position={[-1.45, 3.35, -0.25]}
        center
        distanceFactor={11}
        occlude={false}
        zIndexRange={[10, 20]}
      >
        <button
          type="button"
          onClick={() => selectNode('uplanner-rack')}
          onPointerDown={(e) => e.stopPropagation()}
          className="whitespace-nowrap rounded-md border border-emerald-400/55 bg-slate-950/90 px-3 py-1 font-mono text-[10px] text-emerald-200 shadow-lg backdrop-blur-md transition hover:bg-emerald-500/20"
        >
          {locale === 'es' ? 'Abrir Ficha Uplanner' : 'Open Uplanner Card'}
        </button>
      </Html>

      <Html
        position={[2.15, 3.35, 0.35]}
        center
        distanceFactor={11}
        occlude={false}
        zIndexRange={[10, 20]}
      >
        <button
          type="button"
          onClick={() => selectNode('gss-mobile')}
          onPointerDown={(e) => e.stopPropagation()}
          className="whitespace-nowrap rounded-md border border-cyan-400/55 bg-slate-950/90 px-3 py-1 font-mono text-[10px] text-cyan-200 shadow-lg backdrop-blur-md transition hover:bg-cyan-500/20"
        >
          {locale === 'es' ? 'Abrir Ficha GSS' : 'Open GSS Card'}
        </button>
      </Html>
    </group>
  );
}
