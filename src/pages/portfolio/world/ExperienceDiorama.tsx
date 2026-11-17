import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GlbModel } from '@/components/canvas/GlbModel';
import { InteractiveNode } from '@/components/canvas/InteractiveNode';
import { getStationById } from '@/data/portfolioData';
import etlPulseFrag from '@/shaders/etlPulse.frag';
import etlPulseVert from '@/shaders/etlPulse.vert';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { withBase } from '@/utils/assetUrl';

export function ExperienceDiorama() {
  const station = getStationById('experiencia');
  const locale = usePortfolioStore((s) => s.locale);
  const isDark = usePortfolioStore((s) => s.theme === 'dark');

  const pulseMatPrimary = useRef<THREE.ShaderMaterial>(null);
  const pulseMatSecondary = useRef<THREE.ShaderMaterial>(null);
  const pulseMatTertiary = useRef<THREE.ShaderMaterial>(null);

  const primaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#274a39') },
      uPulseColor: { value: new THREE.Color('#5cb88d') },
      uSpeed: { value: 0.65 },
      uDensity: { value: 3.0 },
    }),
    [],
  );

  const secondaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#4a2d1b') },
      uPulseColor: { value: new THREE.Color('#eb8647') },
      uSpeed: { value: 0.85 },
      uDensity: { value: 2.5 },
    }),
    [],
  );

  const tertiaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color('#4a2d1b') },
      uPulseColor: { value: new THREE.Color('#d98b5f') },
      uSpeed: { value: 0.72 },
      uDensity: { value: 2.6 },
    }),
    [],
  );

  // Curved conduits linking the Uplanner ETL console, server cabinet, and GSS client bay
  const conduits = useMemo(() => {
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.55, 1.15, 0.5),
      new THREE.Vector3(-2.2, 0.42, 0.7),
      new THREE.Vector3(-1.7, 0.36, 0.45),
      new THREE.Vector3(-1.45, 1.05, 0.25),
    ]);
    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.55, 1.32, 0.45),
      new THREE.Vector3(-2.15, 1.85, 0.25),
      new THREE.Vector3(-1.65, 1.98, 0.05),
      new THREE.Vector3(-1.45, 1.85, -0.05),
    ]);
    const c3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.75, 0.88, 0.1),
      new THREE.Vector3(0.45, 0.28, 0.35),
      new THREE.Vector3(1.55, 0.42, 0.35),
      new THREE.Vector3(2.15, 0.9, 0.35),
    ]);
    return {
      tube1: new THREE.TubeGeometry(c1, 40, 0.024, 8, false),
      tube2: new THREE.TubeGeometry(c2, 40, 0.022, 8, false),
      tube3: new THREE.TubeGeometry(c3, 40, 0.02, 8, false),
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

  const labelColor = isDark ? '#f3efe6' : '#161513';

  return (
    <group name="station-experiencia" position={station.position}>
      <InteractiveNode nodeId="uplanner-rack" position={[-1.45, 0, -0.1]}>
        <GlbModel url="/models-3d/uplanner-datacenter.glb" />
      </InteractiveNode>

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
        position={[-1.45, 2.86, -0.15]}
        font={withBase('fonts/Roboto-Bold.ttf')}
        fontSize={0.145}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'Uplanner · Airflow y Polars' : 'Uplanner · Airflow & Polars'}
      </Text>

      <Text
        position={[2.15, 2.75, 0.35]}
        font={withBase('fonts/Roboto-Bold.ttf')}
        fontSize={0.14}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
      >
        {locale === 'es' ? 'GSS · App Móvil REST' : 'GSS · Mobile REST App'}
      </Text>
    </group>
  );
}
