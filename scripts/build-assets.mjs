import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsEmissiveStrength } from '@gltf-transform/extensions';
import { dedup, draco, prune, textureCompress, weld } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR =
  'C:/Users/Jr Cantor/.gemini/antigravity/brain/1ebea7a7-c4da-47e7-be3a-c22fb09910d4';
const SCREENS_DIR = path.join(ROOT, 'public', 'textures', 'screens');
const PBR_DIR = path.join(ROOT, 'public', 'textures', 'pbr');
const RAW_DIR = path.join(ROOT, 'public', 'models-3d', 'raw');
const OUT_DIR = path.join(ROOT, 'public', 'models-3d');
const DRACO_PUBLIC_DIR = path.join(ROOT, 'public', 'draco');

fs.mkdirSync(SCREENS_DIR, { recursive: true });
fs.mkdirSync(PBR_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(DRACO_PUBLIC_DIR, { recursive: true });

function copyDracoDecoders() {
  const srcDir = path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf');
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Missing Three.js Draco decoders at ${srcDir}`);
  }
  for (const file of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, file), path.join(DRACO_PUBLIC_DIR, file));
  }
  console.log('[draco] Copied local decoders to public/draco/');
}

async function prepareScreenTextures() {
  const mapping = [
    { prefix: 'uplanner_etl_screen_', target: 'uplanner-etl-screen.png', w: 1024, h: 512 },
    { prefix: 'gss_mobile_screen_', target: 'gss-mobile-screen.png', w: 512, h: 1024 },
    { prefix: 'workstation_code_screen_', target: 'workstation-code-screen.png', w: 1024, h: 512 },
  ];

  const artifactFiles = fs.existsSync(ARTIFACT_DIR) ? fs.readdirSync(ARTIFACT_DIR) : [];
  const results = {};

  for (const item of mapping) {
    const targetPath = path.join(SCREENS_DIR, item.target);
    const match = artifactFiles.find((f) => f.startsWith(item.prefix) && /\.(jpg|jpeg|png)$/i.test(f));

    if (match) {
      await sharp(path.join(ARTIFACT_DIR, match))
        .resize(item.w, item.h, { fit: 'cover' })
        .png()
        .toFile(targetPath);
    } else if (!fs.existsSync(targetPath)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${item.w}" height="${item.h}">
        <rect width="100%" height="100%" fill="#090d16"/>
        <rect x="24" y="24" width="${item.w - 48}" height="${item.h - 48}" rx="12" fill="#0f172a" stroke="#22d3ee" stroke-width="3"/>
      </svg>`;
      await sharp(Buffer.from(svg)).png().toFile(targetPath);
    }
    results[item.target] = fs.readFileSync(targetPath);
  }
  console.log('[textures] Prepared screen PNG textures');
  return results;
}

async function generatePbrTextures() {
  const size = 1024;

  // Deterministic brushed anodized metal albedo / roughness / normal / AO buffers
  const colorRaw = Buffer.alloc(size * size * 4);
  const roughRaw = Buffer.alloc(size * size * 4);
  const normalRaw = Buffer.alloc(size * size * 4);
  const aoRaw = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    const streak = Math.sin(y * 0.45) * 6 + Math.cos(y * 0.13) * 4;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const micro = ((Math.sin(x * 0.09 + y * 0.02) + 1) * 0.5) * 10;
      const borderX = Math.min(x, size - 1 - x) / size;
      const borderY = Math.min(y, size - 1 - y) / size;
      const edgeFactor = Math.min(1, Math.min(borderX, borderY) * 14);

      const base = Math.max(20, Math.min(240, Math.round(46 + streak + micro)));
      colorRaw[idx] = base;
      colorRaw[idx + 1] = Math.min(255, base + 8);
      colorRaw[idx + 2] = Math.min(255, base + 18);
      colorRaw[idx + 3] = 255;

      const rough = Math.max(55, Math.min(220, Math.round(115 + streak * 2 - micro)));
      roughRaw[idx] = rough;
      roughRaw[idx + 1] = rough;
      roughRaw[idx + 2] = rough;
      roughRaw[idx + 3] = 255;

      const nx = Math.round(128 + Math.cos(x * 0.25) * 14);
      const ny = Math.round(128 + Math.sin(y * 0.45) * 18);
      normalRaw[idx] = nx;
      normalRaw[idx + 1] = ny;
      normalRaw[idx + 2] = 250;
      normalRaw[idx + 3] = 255;

      const aoVal = Math.round(150 + 105 * edgeFactor);
      aoRaw[idx] = aoVal;
      aoRaw[idx + 1] = aoVal;
      aoRaw[idx + 2] = aoVal;
      aoRaw[idx + 3] = 255;
    }
  }

  const albedoBuf = await sharp(colorRaw, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
  const roughBuf = await sharp(roughRaw, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
  const normalBuf = await sharp(normalRaw, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
  const aoBuf = await sharp(aoRaw, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(PBR_DIR, 'metal-albedo.png'), albedoBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-roughness.png'), roughBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-normal.png'), normalBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-ao.png'), aoBuf);

  console.log('[pbr] Generated 1024x1024 PBR metal Normal/Roughness/AO maps');
  return { albedoBuf, roughBuf, normalBuf, aoBuf };
}

function appendGeometryToDocument(doc, scene, matMap, name, geom, matKey, transform = {}) {
  if (transform.flipUvY && geom.getAttribute('uv')) {
    const uv = geom.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, 1 - uv.getY(i));
    }
    uv.needsUpdate = true;
  }

  if (geom.getIndex() && geom.getAttribute('normal') && geom.getAttribute('uv')) {
    geom.computeTangents();
  }

  const posAttr = geom.getAttribute('position');
  const normAttr = geom.getAttribute('normal');
  const uvAttr = geom.getAttribute('uv');
  const tangentAttr = geom.getAttribute('tangent');
  const indexAttr = geom.getIndex();

  const buffer = doc.getRoot().listBuffers()[0] ?? doc.createBuffer('main');
  const prim = doc.createPrimitive();

  const position = doc
    .createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array(posAttr.array))
    .setBuffer(buffer);
  prim.setAttribute('POSITION', position);

  if (normAttr) {
    const normal = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(normAttr.array))
      .setBuffer(buffer);
    prim.setAttribute('NORMAL', normal);
  }

  if (uvAttr) {
    const uv = doc
      .createAccessor()
      .setType('VEC2')
      .setArray(new Float32Array(uvAttr.array))
      .setBuffer(buffer);
    prim.setAttribute('TEXCOORD_0', uv);
  }

  if (tangentAttr) {
    const tangent = doc
      .createAccessor()
      .setType('VEC4')
      .setArray(new Float32Array(tangentAttr.array))
      .setBuffer(buffer);
    prim.setAttribute('TANGENT', tangent);
  }

  if (indexAttr) {
    const idxArray =
      posAttr.count > 65535
        ? new Uint32Array(indexAttr.array)
        : new Uint16Array(indexAttr.array);
    const indices = doc.createAccessor().setType('SCALAR').setArray(idxArray).setBuffer(buffer);
    prim.setIndices(indices);
  }

  prim.setMaterial(matMap[matKey]);
  const mesh = doc.createMesh(name).addPrimitive(prim);
  const node = doc.createNode(name).setMesh(mesh);

  if (transform.position) node.setTranslation(transform.position);
  if (transform.rotation) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(transform.rotation[0], transform.rotation[1], transform.rotation[2]),
    );
    node.setRotation([q.x, q.y, q.z, q.w]);
  }
  if (transform.scale) node.setScale(transform.scale);

  scene.addChild(node);
}

function createMaterialsContext(doc, pbr, screens) {
  const emissiveExt = doc.createExtension(KHRMaterialsEmissiveStrength);
  const albedoTex = doc.createTexture('metal-albedo').setImage(pbr.albedoBuf).setMimeType('image/png');
  const roughTex = doc.createTexture('metal-roughness').setImage(pbr.roughBuf).setMimeType('image/png');
  const normalTex = doc.createTexture('metal-normal').setImage(pbr.normalBuf).setMimeType('image/png');
  const aoTex = doc.createTexture('metal-ao').setImage(pbr.aoBuf).setMimeType('image/png');

  const createScreenMat = (texName, buf, emissiveStrength = 1.2) => {
    const tex = doc.createTexture(texName).setImage(buf).setMimeType('image/png');
    const mat = doc
      .createMaterial(texName)
      .setBaseColorTexture(tex)
      .setEmissiveTexture(tex)
      .setEmissiveFactor([1.0, 1.0, 1.0])
      .setRoughnessFactor(0.18)
      .setMetallicFactor(0.05);
    mat.setExtension(
      'KHR_materials_emissive_strength',
      emissiveExt.createEmissiveStrength().setEmissiveStrength(emissiveStrength),
    );
    return mat;
  };

  const withEmissiveBoost = (mat, strength) => {
    mat.setExtension(
      'KHR_materials_emissive_strength',
      emissiveExt.createEmissiveStrength().setEmissiveStrength(strength),
    );
    return mat;
  };

  return {
    darkChassis: doc
      .createMaterial('darkChassis')
      .setBaseColorFactor([0.26, 0.33, 0.44, 1])
      .setBaseColorTexture(albedoTex)
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setOcclusionTexture(aoTex)
      .setMetallicFactor(0.68)
      .setRoughnessFactor(0.42),
    slatePlinth: doc
      .createMaterial('slatePlinth')
      .setBaseColorFactor([0.16, 0.22, 0.34, 1])
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setOcclusionTexture(aoTex)
      .setMetallicFactor(0.45)
      .setRoughnessFactor(0.58),
    brushedSilver: doc
      .createMaterial('brushedSilver')
      .setBaseColorFactor([0.65, 0.72, 0.82, 1])
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setMetallicFactor(0.88)
      .setRoughnessFactor(0.28),
    cyanGlow: withEmissiveBoost(
      doc
        .createMaterial('cyanGlow')
        .setBaseColorFactor([0.1, 0.72, 0.88, 1])
        .setEmissiveFactor([0.08, 0.62, 0.78])
        .setRoughnessFactor(0.25)
        .setMetallicFactor(0.25),
      1.18,
    ),
    emeraldGlow: withEmissiveBoost(
      doc
        .createMaterial('emeraldGlow')
        .setBaseColorFactor([0.06, 0.68, 0.48, 1])
        .setEmissiveFactor([0.06, 0.58, 0.42])
        .setRoughnessFactor(0.25)
        .setMetallicFactor(0.2),
      1.16,
    ),
    amberGlow: withEmissiveBoost(
      doc
        .createMaterial('amberGlow')
        .setBaseColorFactor([0.92, 0.58, 0.06, 1])
        .setEmissiveFactor([0.78, 0.48, 0.05])
        .setRoughnessFactor(0.25)
        .setMetallicFactor(0.2),
      1.15,
    ),
    indigoGlow: withEmissiveBoost(
      doc
        .createMaterial('indigoGlow')
        .setBaseColorFactor([0.45, 0.5, 0.92, 1])
        .setEmissiveFactor([0.38, 0.44, 0.85])
        .setRoughnessFactor(0.25)
        .setMetallicFactor(0.2),
      1.15,
    ),
    screenWorkstation: createScreenMat('workstation-screen', screens['workstation-code-screen.png'], 1.05),
    screenUplanner: createScreenMat('uplanner-screen', screens['uplanner-etl-screen.png'], 1.05),
    screenGss: createScreenMat('gss-screen', screens['gss-mobile-screen.png'], 1.05),
  };
}

function buildWorkstation(doc, scene, mats) {
  // Base plinth
  appendGeometryToDocument(doc, scene, mats, 'ws_plinth', new THREE.CylinderGeometry(2.15, 2.35, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_ring', new THREE.TorusGeometry(2.2, 0.025, 8, 48), 'cyanGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // Desk top & legs
  appendGeometryToDocument(doc, scene, mats, 'ws_desk_top', new THREE.BoxGeometry(2.5, 0.07, 1.2), 'darkChassis', { position: [0, 0.86, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_leg_l', new THREE.BoxGeometry(0.08, 0.72, 0.95), 'brushedSilver', { position: [-1.1, 0.5, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_leg_r', new THREE.BoxGeometry(0.08, 0.72, 0.95), 'brushedSilver', { position: [1.1, 0.5, 0] });

  // Main Ultrawide Monitor
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_stand', new THREE.BoxGeometry(0.14, 0.36, 0.08), 'brushedSilver', { position: [-0.15, 1.07, -0.32] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_frame', new THREE.BoxGeometry(1.48, 0.78, 0.05), 'darkChassis', { position: [-0.15, 1.38, -0.26] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_screen', new THREE.PlaneGeometry(1.4, 0.7), 'screenWorkstation', { position: [-0.15, 1.38, -0.232], flipUvY: true });

  // Secondary angled monitor
  appendGeometryToDocument(doc, scene, mats, 'ws_side_frame', new THREE.BoxGeometry(0.68, 0.52, 0.045), 'darkChassis', { position: [0.85, 1.3, -0.14], rotation: [0, -0.38, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_side_screen', new THREE.PlaneGeometry(0.62, 0.45), 'screenUplanner', { position: [0.84, 1.3, -0.115], rotation: [0, -0.38, 0], flipUvY: true });

  // SFF PC Tower with cyan front strip
  appendGeometryToDocument(doc, scene, mats, 'ws_pc_case', new THREE.BoxGeometry(0.32, 0.52, 0.54), 'darkChassis', { position: [-1.02, 1.15, -0.15] });
  appendGeometryToDocument(doc, scene, mats, 'ws_pc_led', new THREE.BoxGeometry(0.025, 0.44, 0.025), 'cyanGlow', { position: [-0.86, 1.15, 0.12] });

  // Keyboard, mouse & floating code core badge
  appendGeometryToDocument(doc, scene, mats, 'ws_keyboard', new THREE.BoxGeometry(0.56, 0.025, 0.2), 'brushedSilver', { position: [-0.15, 0.91, 0.22] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mouse', new THREE.BoxGeometry(0.08, 0.03, 0.13), 'brushedSilver', { position: [0.28, 0.91, 0.22] });
  appendGeometryToDocument(doc, scene, mats, 'ws_holo_core', new THREE.IcosahedronGeometry(0.16, 0), 'cyanGlow', { position: [0.92, 1.84, -0.14] });
}

function buildUplannerDatacenter(doc, scene, mats) {
  // Base plinth
  appendGeometryToDocument(doc, scene, mats, 'up_plinth', new THREE.CylinderGeometry(1.75, 1.92, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'up_ring', new THREE.TorusGeometry(1.8, 0.025, 8, 48), 'emeraldGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // Central 42U Rack Frame
  appendGeometryToDocument(doc, scene, mats, 'up_rack_body', new THREE.BoxGeometry(1.18, 2.35, 1.05), 'darkChassis', { position: [0, 1.34, -0.15] });
  appendGeometryToDocument(doc, scene, mats, 'up_rack_top', new THREE.BoxGeometry(1.26, 0.1, 1.12), 'brushedSilver', { position: [0, 2.54, -0.15] });

  // 8 Server Blades with alternating emerald/cyan telemetry LED strips
  for (let i = 0; i < 8; i++) {
    const y = 0.48 + i * 0.23;
    appendGeometryToDocument(doc, scene, mats, `up_blade_${i}`, new THREE.BoxGeometry(1.04, 0.16, 0.06), 'brushedSilver', { position: [0, y, 0.39] });
    appendGeometryToDocument(
      doc,
      scene,
      mats,
      `up_led_${i}`,
      new THREE.BoxGeometry(0.86, 0.028, 0.02),
      i % 2 === 0 ? 'emeraldGlow' : 'cyanGlow',
      { position: [0, y, 0.425] },
    );
  }

  // Telemetry Audit Console Screen in front-right of rack
  appendGeometryToDocument(doc, scene, mats, 'up_console_post', new THREE.CylinderGeometry(0.05, 0.07, 0.92, 12), 'brushedSilver', { position: [-1.08, 0.62, 0.52] });
  appendGeometryToDocument(doc, scene, mats, 'up_console_frame', new THREE.BoxGeometry(1.06, 0.58, 0.05), 'darkChassis', { position: [-1.08, 1.24, 0.52], rotation: [-0.22, 0.32, 0] });
  appendGeometryToDocument(doc, scene, mats, 'up_console_screen', new THREE.PlaneGeometry(0.98, 0.5), 'screenUplanner', { position: [-1.07, 1.245, 0.548], rotation: [-0.22, 0.32, 0], flipUvY: true });
}

function buildGssMobile(doc, scene, mats) {
  // Base plinth
  appendGeometryToDocument(doc, scene, mats, 'gss_plinth', new THREE.CylinderGeometry(1.35, 1.5, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'gss_ring', new THREE.TorusGeometry(1.4, 0.024, 8, 44), 'cyanGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // Angled Exhibition Pedestal
  appendGeometryToDocument(doc, scene, mats, 'gss_pedestal', new THREE.CylinderGeometry(0.32, 0.44, 0.85, 16), 'darkChassis', { position: [0, 0.58, 0] });

  // Sleek Smartphone Mockup tilted at 16 deg
  const tilt = [-0.28, -0.25, 0];
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_body', new THREE.BoxGeometry(0.86, 1.68, 0.07), 'brushedSilver', { position: [0, 1.65, 0], rotation: tilt });
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_bezel', new THREE.BoxGeometry(0.8, 1.6, 0.02), 'darkChassis', { position: [0, 1.65, 0.032], rotation: tilt });
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_screen', new THREE.PlaneGeometry(0.74, 1.48), 'screenGss', { position: [-0.012, 1.652, 0.046], rotation: tilt, flipUvY: true });

  // 3 REST API / Auth Microservice Satellite Nodes
  const satellites = [
    { name: 'gss_sat_auth', pos: [-0.92, 1.95, -0.2], mat: 'amberGlow' },
    { name: 'gss_sat_rest', pos: [0.94, 2.05, -0.15], mat: 'cyanGlow' },
    { name: 'gss_sat_sync', pos: [0.78, 1.22, 0.42], mat: 'emeraldGlow' },
  ];
  for (const sat of satellites) {
    appendGeometryToDocument(doc, scene, mats, `${sat.name}_shell`, new THREE.OctahedronGeometry(0.16, 0), sat.mat, { position: sat.pos });
    appendGeometryToDocument(doc, scene, mats, `${sat.name}_ring`, new THREE.TorusGeometry(0.24, 0.015, 8, 24), 'brushedSilver', { position: sat.pos, rotation: [Math.PI / 3, 0.4, 0] });
  }
}

function buildSkillsHub(doc, scene, mats) {
  appendGeometryToDocument(doc, scene, mats, 'sk_plinth', new THREE.CylinderGeometry(2.1, 2.3, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'sk_ring', new THREE.TorusGeometry(2.15, 0.025, 8, 48), 'indigoGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // 4 Domain Pillars (Data, Software, Cloud, AI/BI)
  const pillars = [
    { pos: [-1.15, 0.9, 0.65], h: 1.45, glow: 'emeraldGlow' },
    { pos: [1.15, 0.98, 0.65], h: 1.6, glow: 'cyanGlow' },
    { pos: [-1.15, 1.02, -0.75], h: 1.68, glow: 'indigoGlow' },
    { pos: [1.15, 0.85, -0.75], h: 1.35, glow: 'amberGlow' },
  ];
  pillars.forEach((p, idx) => {
    appendGeometryToDocument(doc, scene, mats, `sk_pillar_${idx}`, new THREE.BoxGeometry(0.42, p.h, 0.42), 'darkChassis', { position: [p.pos[0], p.h * 0.5 + 0.16, p.pos[2]] });
    appendGeometryToDocument(doc, scene, mats, `sk_cap_${idx}`, new THREE.BoxGeometry(0.46, 0.08, 0.46), p.glow, { position: [p.pos[0], p.h + 0.2, p.pos[2]] });
  });

  // Central Stratified Certifications Totem (2021-2026)
  appendGeometryToDocument(doc, scene, mats, 'sk_totem_core', new THREE.CylinderGeometry(0.24, 0.34, 2.1, 16), 'brushedSilver', { position: [0, 1.2, -0.05] });
  for (let r = 0; r < 6; r++) {
    appendGeometryToDocument(doc, scene, mats, `sk_cert_ring_${r}`, new THREE.TorusGeometry(0.42 - r * 0.03, 0.025, 8, 28), r % 2 === 0 ? 'cyanGlow' : 'indigoGlow', {
      position: [0, 0.52 + r * 0.28, -0.05],
      rotation: [Math.PI / 2, 0, 0],
    });
  }
}

function buildProjectsStage(doc, scene, mats) {
  appendGeometryToDocument(doc, scene, mats, 'pr_plinth', new THREE.CylinderGeometry(2.0, 2.2, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'pr_ring', new THREE.TorusGeometry(2.05, 0.025, 8, 48), 'cyanGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // Web3D Module (Arch + Faceted Metallic Core)
  appendGeometryToDocument(doc, scene, mats, 'pr_arch_base', new THREE.BoxGeometry(1.3, 0.22, 1.0), 'darkChassis', { position: [-0.85, 0.27, 0.1] });
  appendGeometryToDocument(doc, scene, mats, 'pr_web3d_core', new THREE.IcosahedronGeometry(0.46, 0), 'brushedSilver', { position: [-0.85, 1.35, 0.1] });
  appendGeometryToDocument(doc, scene, mats, 'pr_web3d_ring', new THREE.TorusGeometry(0.66, 0.028, 8, 32), 'cyanGlow', { position: [-0.85, 1.35, 0.1], rotation: [Math.PI / 3, 0.4, 0] });

  // Data Pipeline Module (ETL stacked nodes)
  appendGeometryToDocument(doc, scene, mats, 'pr_data_base', new THREE.BoxGeometry(1.2, 0.22, 1.0), 'darkChassis', { position: [0.9, 0.27, -0.1] });
  appendGeometryToDocument(doc, scene, mats, 'pr_data_n1', new THREE.CylinderGeometry(0.32, 0.32, 0.28, 16), 'brushedSilver', { position: [0.9, 0.65, -0.1] });
  appendGeometryToDocument(doc, scene, mats, 'pr_data_n2', new THREE.CylinderGeometry(0.28, 0.28, 0.28, 16), 'emeraldGlow', { position: [0.9, 1.08, -0.1] });
  appendGeometryToDocument(doc, scene, mats, 'pr_data_n3', new THREE.CylinderGeometry(0.24, 0.24, 0.28, 16), 'brushedSilver', { position: [0.9, 1.5, -0.1] });
}

function buildContactBeacon(doc, scene, mats) {
  appendGeometryToDocument(doc, scene, mats, 'ct_plinth', new THREE.CylinderGeometry(1.75, 1.95, 0.16, 24), 'slatePlinth', { position: [0, 0.08, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ct_ring', new THREE.TorusGeometry(1.8, 0.025, 8, 48), 'amberGlow', { position: [0, 0.16, 0], rotation: [Math.PI / 2, 0, 0] });

  // Communication Console + Tilted 3D CV Card + Signal Beacon
  appendGeometryToDocument(doc, scene, mats, 'ct_desk', new THREE.BoxGeometry(1.5, 0.72, 0.68), 'darkChassis', { position: [0, 0.52, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ct_cv_slab', new THREE.BoxGeometry(0.84, 1.12, 0.04), 'brushedSilver', { position: [-0.36, 1.45, 0.12], rotation: [-0.18, 0.15, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ct_cv_header', new THREE.BoxGeometry(0.76, 0.18, 0.05), 'cyanGlow', { position: [-0.34, 1.84, 0.05], rotation: [-0.18, 0.15, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ct_antenna_mast', new THREE.CylinderGeometry(0.04, 0.06, 1.45, 12), 'brushedSilver', { position: [0.58, 1.56, -0.1] });
  appendGeometryToDocument(doc, scene, mats, 'ct_beacon_orb', new THREE.SphereGeometry(0.14, 16, 12), 'amberGlow', { position: [0.58, 2.34, -0.1] });
}

function countTriangles(doc) {
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      if (idx) tris += idx.getCount() / 3;
      else if (pos) tris += pos.getCount() / 3;
    }
  }
  return Math.round(tris);
}

async function buildAndOptimize(name, builderFn, pbr, screens) {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const doc = new Document();
  const scene = doc.createScene(name);
  const mats = createMaterialsContext(doc, pbr, screens);
  builderFn(doc, scene, mats);

  const tris = countTriangles(doc);
  if (tris > 18000) {
    throw new Error(`${name} exceeded 18,000 triangle budget (${tris})`);
  }

  const rawPath = path.join(RAW_DIR, `${name}.glb`);
  const optPath = path.join(OUT_DIR, `${name}.glb`);

  await io.write(rawPath, doc);
  const rawBytes = fs.statSync(rawPath).size;

  const optDoc = await io.read(rawPath);
  await optDoc.transform(
    dedup(),
    weld(),
    prune(),
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      resize: [1024, 1024],
      quality: 82,
    }),
    draco({
      method: 'edgebreaker',
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12,
    }),
  );
  await io.write(optPath, optDoc);
  const optBytes = fs.statSync(optPath).size;
  const savings = (((rawBytes - optBytes) / rawBytes) * 100).toFixed(1);

  console.log(
    `[asset] ${name}.glb | tris=${tris} | raw=${(rawBytes / 1024).toFixed(1)}KB -> draco+webp=${(optBytes / 1024).toFixed(1)}KB (-${savings}%)`,
  );
}

async function main() {
  copyDracoDecoders();
  const screens = await prepareScreenTextures();
  const pbr = await generatePbrTextures();

  await buildAndOptimize('workstation', buildWorkstation, pbr, screens);
  await buildAndOptimize('uplanner-datacenter', buildUplannerDatacenter, pbr, screens);
  await buildAndOptimize('gss-mobile', buildGssMobile, pbr, screens);
  await buildAndOptimize('skills-hub', buildSkillsHub, pbr, screens);
  await buildAndOptimize('projects-stage', buildProjectsStage, pbr, screens);
  await buildAndOptimize('contact-beacon', buildContactBeacon, pbr, screens);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
