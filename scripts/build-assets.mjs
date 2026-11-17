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

function renderWorkstationSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
    <rect width="1024" height="512" fill="#161513"/>
    <rect x="0" y="0" width="210" height="512" fill="#1E1D1A"/>
    <line x1="210" y1="0" x2="210" y2="512" stroke="#34312B" stroke-width="2"/>
    <line x1="210" y1="44" x2="1024" y2="44" stroke="#34312B" stroke-width="2"/>
    <text x="24" y="30" fill="#B5AFA4" font-family="monospace" font-size="14" font-weight="600">PORTFOLIO / SRC</text>
    <text x="24" y="80" fill="#EB8647" font-family="monospace" font-size="14">pipeline_parity.py</text>
    <text x="24" y="110" fill="#B5AFA4" font-family="monospace" font-size="14">airflow_dags.py</text>
    <text x="24" y="140" fill="#B5AFA4" font-family="monospace" font-size="14">SceneCanvas.tsx</text>
    <text x="24" y="170" fill="#B5AFA4" font-family="monospace" font-size="14">CameraRig.tsx</text>
    <text x="24" y="200" fill="#5CB88D" font-family="monospace" font-size="14">blueprintGrid.frag</text>

    <rect x="210" y="0" width="210" height="44" fill="#1E1D1A"/>
    <rect x="210" y="42" width="210" height="2" fill="#EB8647"/>
    <text x="234" y="28" fill="#F3EFE6" font-family="monospace" font-size="14">pipeline_parity.py</text>
    <text x="454" y="28" fill="#B5AFA4" font-family="monospace" font-size="14">SceneCanvas.tsx</text>

    <g font-family="monospace" font-size="16">
      <text x="238" y="92" fill="#726D64">01</text><text x="276" y="92" fill="#EB8647">import</text><text x="348" y="92" fill="#F3EFE6">polars as pl</text>
      <text x="238" y="124" fill="#726D64">02</text><text x="276" y="124" fill="#EB8647">from</text><text x="328" y="124" fill="#F3EFE6">airflow.decorators import dag, task</text>
      <text x="238" y="172" fill="#726D64">04</text><text x="276" y="172" fill="#5CB88D">@task</text>
      <text x="238" y="204" fill="#726D64">05</text><text x="276" y="204" fill="#EB8647">def</text><text x="318" y="204" fill="#F3EFE6">verify_batch_parity(src_uri: str):</text>
      <text x="238" y="236" fill="#726D64">06</text><text x="304" y="236" fill="#B5AFA4">df = pl.scan_parquet(src_uri)</text>
      <text x="238" y="268" fill="#726D64">07</text><text x="304" y="268" fill="#B5AFA4">summary = df.group_by("tenant_id").agg([</text>
      <text x="238" y="300" fill="#726D64">08</text><text x="332" y="300" fill="#5CB88D">pl.len().alias("row_count"),</text>
      <text x="238" y="332" fill="#726D64">09</text><text x="332" y="332" fill="#5CB88D">pl.col("checksum").sum(),</text>
      <text x="238" y="364" fill="#726D64">10</text><text x="304" y="364" fill="#B5AFA4">]).collect()</text>
      <text x="238" y="396" fill="#726D64">11</text><text x="304" y="396" fill="#EB8647">return</text><text x="376" y="396" fill="#F3EFE6">summary.to_dicts()</text>
    </g>

    <rect x="238" y="432" width="750" height="54" rx="4" fill="#1E1D1A" stroke="#34312B" stroke-width="2"/>
    <circle cx="262" cy="459" r="6" fill="#5CB88D"/>
    <text x="282" y="464" fill="#F3EFE6" font-family="sans-serif" font-size="15">Parity audit check complete: Airflow DAG + Polars columnar engine</text>
  </svg>`;
}

function renderUplannerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
    <rect width="1024" height="512" fill="#161513"/>
    <rect x="28" y="28" width="968" height="456" rx="6" fill="#1E1D1A" stroke="#34312B" stroke-width="2"/>
    <text x="56" y="72" fill="#EB8647" font-family="sans-serif" font-size="15" font-weight="600">UPLANNER · DATA INFRASTRUCTURE</text>
    <text x="56" y="106" fill="#F3EFE6" font-family="sans-serif" font-size="26" font-weight="600">Apache Airflow DAG + Polars Parity Monitor</text>
    <line x1="56" y1="128" x2="968" y2="128" stroke="#34312B" stroke-width="2"/>

    <g transform="translate(56, 175)">
      <rect width="188" height="120" rx="6" fill="#161513" stroke="#726D64" stroke-width="2"/>
      <text x="20" y="38" fill="#B5AFA4" font-family="monospace" font-size="13">01 EXTRACT</text>
      <text x="20" y="68" fill="#F3EFE6" font-family="sans-serif" font-size="18" font-weight="600">SQL Sources</text>
      <text x="20" y="96" fill="#5CB88D" font-family="monospace" font-size="13">Schema synced</text>
    </g>

    <line x1="244" y1="235" x2="292" y2="235" stroke="#EB8647" stroke-width="3"/>

    <g transform="translate(292, 175)">
      <rect width="196" height="120" rx="6" fill="#161513" stroke="#EB8647" stroke-width="2"/>
      <text x="20" y="38" fill="#EB8647" font-family="monospace" font-size="13">02 TRANSFORM</text>
      <text x="20" y="68" fill="#F3EFE6" font-family="sans-serif" font-size="18" font-weight="600">Polars Engine</text>
      <text x="20" y="96" fill="#B5AFA4" font-family="monospace" font-size="13">Lazy columnar</text>
    </g>

    <line x1="488" y1="235" x2="536" y2="235" stroke="#EB8647" stroke-width="3"/>

    <g transform="translate(536, 175)">
      <rect width="196" height="120" rx="6" fill="#161513" stroke="#5CB88D" stroke-width="2"/>
      <text x="20" y="38" fill="#5CB88D" font-family="monospace" font-size="13">03 VALIDATE</text>
      <text x="20" y="68" fill="#F3EFE6" font-family="sans-serif" font-size="18" font-weight="600">Parity Audit</text>
      <text x="20" y="96" fill="#5CB88D" font-family="monospace" font-size="13">Rules verified</text>
    </g>

    <line x1="732" y1="235" x2="780" y2="235" stroke="#5CB88D" stroke-width="3"/>

    <g transform="translate(780, 175)">
      <rect width="188" height="120" rx="6" fill="#161513" stroke="#726D64" stroke-width="2"/>
      <text x="20" y="38" fill="#B5AFA4" font-family="monospace" font-size="13">04 EXPOSE</text>
      <text x="20" y="68" fill="#F3EFE6" font-family="sans-serif" font-size="18" font-weight="600">Streamlit UI</text>
      <text x="20" y="96" fill="#B5AFA4" font-family="monospace" font-size="13">Internal audit</text>
    </g>

    <rect x="56" y="346" width="912" height="100" rx="6" fill="#161513" stroke="#34312B" stroke-width="2"/>
    <text x="80" y="384" fill="#F3EFE6" font-family="sans-serif" font-size="17" font-weight="600">Schema Migration &amp; Business Rules Governance</text>
    <text x="80" y="418" fill="#B5AFA4" font-family="monospace" font-size="14">Python · Apache Airflow · Polars · SQL / NoSQL · Corporate Web Audits</text>
  </svg>`;
}

function renderGssMobileSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="1024" viewBox="0 0 512 1024">
    <rect width="512" height="1024" fill="#F4F1EA"/>
    <rect x="0" y="0" width="512" height="148" fill="#161513"/>
    <text x="36" y="64" fill="#EB8647" font-family="monospace" font-size="16" font-weight="600">GLOBAL SYSTEM SOLUTIONS</text>
    <text x="36" y="108" fill="#F3EFE6" font-family="sans-serif" font-size="30" font-weight="600">Gestión de Pedidos</text>

    <rect x="32" y="182" width="448" height="72" rx="8" fill="#FFFFFF" stroke="#D5CEBF" stroke-width="2"/>
    <circle cx="64" cy="218" r="8" fill="#1F6B4B"/>
    <text x="88" y="224" fill="#161513" font-family="sans-serif" font-size="19" font-weight="600">REST API Sync · Auth Verified</text>

    <g transform="translate(32, 286)">
      <rect width="448" height="168" rx="8" fill="#FFFFFF" stroke="#8C867B" stroke-width="2"/>
      <text x="24" y="44" fill="#57524A" font-family="monospace" font-size="16">PEDIDO #GSS-4092</text>
      <text x="24" y="88" fill="#161513" font-family="sans-serif" font-size="24" font-weight="600">Registro y despacho activo</text>
      <rect x="24" y="112" width="134" height="32" rx="4" fill="#B84A14"/>
      <text x="40" y="133" fill="#F4F1EA" font-family="monospace" font-size="15">EN RUTA</text>
    </g>

    <g transform="translate(32, 482)">
      <rect width="448" height="168" rx="8" fill="#FFFFFF" stroke="#D5CEBF" stroke-width="2"/>
      <text x="24" y="44" fill="#57524A" font-family="monospace" font-size="16">PEDIDO #GSS-4091</text>
      <text x="24" y="88" fill="#161513" font-family="sans-serif" font-size="24" font-weight="600">Sincronizado con backend</text>
      <rect x="24" y="112" width="156" height="32" rx="4" fill="#1F6B4B"/>
      <text x="40" y="133" fill="#F4F1EA" font-family="monospace" font-size="15">CONFIRMADO</text>
    </g>

    <g transform="translate(32, 678)">
      <rect width="448" height="168" rx="8" fill="#FFFFFF" stroke="#D5CEBF" stroke-width="2"/>
      <text x="24" y="44" fill="#57524A" font-family="monospace" font-size="16">PEDIDO #GSS-4090</text>
      <text x="24" y="88" fill="#161513" font-family="sans-serif" font-size="24" font-weight="600">Entrega validada en cliente</text>
      <rect x="24" y="112" width="156" height="32" rx="4" fill="#E6E0D4"/>
      <text x="40" y="133" fill="#161513" font-family="monospace" font-size="15">COMPLETADO</text>
    </g>

    <rect x="0" y="904" width="512" height="120" fill="#161513"/>
    <text x="36" y="956" fill="#F3EFE6" font-family="sans-serif" font-size="18">Auth · Endpoints REST · QA Producción</text>
    <text x="36" y="990" fill="#B5AFA4" font-family="monospace" font-size="14">Enero 2024 a Junio 2024</text>
  </svg>`;
}

function renderContactCvSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="896" viewBox="0 0 640 896">
    <rect width="640" height="896" fill="#F4F1EA"/>
    <rect x="24" y="24" width="592" height="848" fill="#FFFFFF" stroke="#D5CEBF" stroke-width="2"/>
    <rect x="24" y="24" width="592" height="10" fill="#B84A14"/>

    <text x="58" y="98" fill="#B84A14" font-family="monospace" font-size="15" font-weight="600">HOJA DE VIDA · CALI, COLOMBIA</text>
    <text x="58" y="148" fill="#161513" font-family="Georgia, serif" font-size="34" font-weight="600">Junior Orlando Cantor</text>
    <text x="58" y="186" fill="#57524A" font-family="sans-serif" font-size="20">Ingeniería de Sistemas · Software, Datos e IA</text>
    <line x1="58" y1="214" x2="582" y2="214" stroke="#161513" stroke-width="2"/>

    <text x="58" y="262" fill="#B84A14" font-family="monospace" font-size="14" font-weight="600">EXPERIENCIA PROFESIONAL</text>
    <text x="58" y="298" fill="#161513" font-family="sans-serif" font-size="20" font-weight="600">Uplanner · Practicante de Ingeniería de Software</text>
    <text x="58" y="326" fill="#57524A" font-family="monospace" font-size="15">Apache Airflow · Polars · Parity Audit · Streamlit</text>

    <text x="58" y="380" fill="#161513" font-family="sans-serif" font-size="20" font-weight="600">Global System Solutions · Desarrollador Móvil</text>
    <text x="58" y="408" fill="#57524A" font-family="monospace" font-size="15">Gestión de pedidos · APIs REST · Auth · QA</text>
    <line x1="58" y1="444" x2="582" y2="444" stroke="#D5CEBF" stroke-width="2"/>

    <text x="58" y="492" fill="#B84A14" font-family="monospace" font-size="14" font-weight="600">FORMACIÓN Y COMPETENCIAS</text>
    <text x="58" y="528" fill="#161513" font-family="sans-serif" font-size="18">Universidad del Valle (9.º semestre aprobado)</text>
    <text x="58" y="560" fill="#57524A" font-family="sans-serif" font-size="17">Python · TypeScript · React · Three.js · Docker · AWS · GCP</text>
    <text x="58" y="594" fill="#57524A" font-family="sans-serif" font-size="17">10 certificaciones verificables (2021 a 2026)</text>
    <line x1="58" y1="636" x2="582" y2="636" stroke="#D5CEBF" stroke-width="2"/>

    <text x="58" y="684" fill="#B84A14" font-family="monospace" font-size="14" font-weight="600">CONTACTO DIRECTO</text>
    <text x="58" y="722" fill="#161513" font-family="monospace" font-size="19" font-weight="600">junior.cantor11@gmail.com</text>
    <text x="58" y="758" fill="#57524A" font-family="monospace" font-size="16">linkedin.com/in/junior-cantor-arevalo</text>
    <text x="58" y="794" fill="#57524A" font-family="monospace" font-size="15">github.com/cantor11 · Remoto / Híbrido</text>
    <text x="58" y="826" fill="#57524A" font-family="monospace" font-size="14">Teléfono directo y referencias en CV PDF</text>
  </svg>`;
}

async function prepareScreenTextures() {
  const specs = [
    { target: 'workstation-code-screen.png', svg: renderWorkstationSvg() },
    { target: 'uplanner-etl-screen.png', svg: renderUplannerSvg() },
    { target: 'gss-mobile-screen.png', svg: renderGssMobileSvg() },
    { target: 'contact-cv-screen.png', svg: renderContactCvSvg() },
  ];

  const results = {};
  for (const item of specs) {
    const targetPath = path.join(SCREENS_DIR, item.target);
    await sharp(Buffer.from(item.svg)).png().toFile(targetPath);
    results[item.target] = fs.readFileSync(targetPath);
  }
  console.log('[textures] Generated palette-coherent editorial SVG->PNG screens');
  return results;
}

async function generatePbrTextures() {
  const size = 2048;

  // Anisotropic brushed metal / bead-blasted architectural slate PBR maps
  const colorRaw = Buffer.alloc(size * size * 4);
  const roughRaw = Buffer.alloc(size * size * 4);
  const normalRaw = Buffer.alloc(size * size * 4);
  const aoRaw = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    const fineGrain = Math.sin(y * 0.6) * 3.5 + Math.cos(y * 0.17) * 2.5;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const micro = ((Math.sin(x * 0.12 + y * 0.03) + 1) * 0.5) * 6;
      const borderX = Math.min(x, size - 1 - x) / size;
      const borderY = Math.min(y, size - 1 - y) / size;
      const edgeFactor = Math.min(1, Math.min(borderX, borderY) * 16);

      // Neutral warm-balanced tonal value so baseColorFactor controls material hue cleanly
      const base = Math.max(180, Math.min(248, Math.round(218 + fineGrain + micro * 0.5)));
      colorRaw[idx] = base;
      colorRaw[idx + 1] = base - 2;
      colorRaw[idx + 2] = base - 6;
      colorRaw[idx + 3] = 255;

      const rough = Math.max(70, Math.min(220, Math.round(132 + fineGrain * 2 - micro)));
      roughRaw[idx] = rough;
      roughRaw[idx + 1] = rough;
      roughRaw[idx + 2] = rough;
      roughRaw[idx + 3] = 255;

      const nx = Math.round(128 + Math.cos(x * 0.25) * 9);
      const ny = Math.round(128 + Math.sin(y * 0.45) * 11);
      normalRaw[idx] = nx;
      normalRaw[idx + 1] = ny;
      normalRaw[idx + 2] = 252;
      normalRaw[idx + 3] = 255;

      const aoVal = Math.round(170 + 85 * edgeFactor);
      aoRaw[idx] = aoVal;
      aoRaw[idx + 1] = aoVal;
      aoRaw[idx + 2] = aoVal;
      aoRaw[idx + 3] = 255;
    }
  }

  const albedoBuf = await sharp(colorRaw, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
  const roughBuf = await sharp(roughRaw, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
  const normalBuf = await sharp(normalRaw, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
  const aoBuf = await sharp(aoRaw, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();

  fs.writeFileSync(path.join(PBR_DIR, 'metal-albedo.png'), albedoBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-roughness.png'), roughBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-normal.png'), normalBuf);
  fs.writeFileSync(path.join(PBR_DIR, 'metal-ao.png'), aoBuf);

  console.log('[pbr] Generated 2048x2048 warm architectural PBR maps');
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

  prim.setAttribute(
    'POSITION',
    doc.createAccessor().setType('VEC3').setArray(new Float32Array(posAttr.array)).setBuffer(buffer),
  );
  if (normAttr) {
    prim.setAttribute(
      'NORMAL',
      doc.createAccessor().setType('VEC3').setArray(new Float32Array(normAttr.array)).setBuffer(buffer),
    );
  }
  if (uvAttr) {
    prim.setAttribute(
      'TEXCOORD_0',
      doc.createAccessor().setType('VEC2').setArray(new Float32Array(uvAttr.array)).setBuffer(buffer),
    );
  }
  if (tangentAttr) {
    prim.setAttribute(
      'TANGENT',
      doc.createAccessor().setType('VEC4').setArray(new Float32Array(tangentAttr.array)).setBuffer(buffer),
    );
  }
  if (indexAttr) {
    const idxArray =
      posAttr.count > 65535 ? new Uint32Array(indexAttr.array) : new Uint16Array(indexAttr.array);
    prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(idxArray).setBuffer(buffer));
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

  const createScreenMat = (texName, buf, emissiveStrength = 0.72, isMattePrint = false) => {
    const tex = doc.createTexture(texName).setImage(buf).setMimeType('image/png');
    const mat = doc
      .createMaterial(texName)
      .setBaseColorTexture(tex)
      .setRoughnessFactor(isMattePrint ? 0.76 : 0.28)
      .setMetallicFactor(0.02);
    if (!isMattePrint) {
      mat
        .setEmissiveTexture(tex)
        .setEmissiveFactor([0.85, 0.85, 0.85])
        .setExtension(
          'KHR_materials_emissive_strength',
          emissiveExt.createEmissiveStrength().setEmissiveStrength(emissiveStrength),
        );
    }
    return mat;
  };

  const withEmissive = (mat, strength) => {
    mat.setExtension(
      'KHR_materials_emissive_strength',
      emissiveExt.createEmissiveStrength().setEmissiveStrength(strength),
    );
    return mat;
  };

  return {
    basaltPlinth: doc
      .createMaterial('basaltPlinth')
      .setBaseColorFactor([0.16, 0.15, 0.135, 1])
      .setBaseColorTexture(albedoTex)
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setOcclusionTexture(aoTex)
      .setMetallicFactor(0.14)
      .setRoughnessFactor(0.84),
    darkAnodized: doc
      .createMaterial('darkAnodized')
      .setBaseColorFactor([0.23, 0.215, 0.195, 1])
      .setBaseColorTexture(albedoTex)
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setOcclusionTexture(aoTex)
      .setMetallicFactor(0.66)
      .setRoughnessFactor(0.46),
    warmAluminum: doc
      .createMaterial('warmAluminum')
      .setBaseColorFactor([0.78, 0.75, 0.71, 1])
      .setBaseColorTexture(albedoTex)
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setMetallicFactor(0.86)
      .setRoughnessFactor(0.32),
    satinCopper: doc
      .createMaterial('satinCopper')
      .setBaseColorFactor([0.76, 0.44, 0.24, 1])
      .setBaseColorTexture(albedoTex)
      .setMetallicRoughnessTexture(roughTex)
      .setNormalTexture(normalTex)
      .setMetallicFactor(0.84)
      .setRoughnessFactor(0.34),
    warmPaper: doc
      .createMaterial('warmPaper')
      .setBaseColorFactor([0.92, 0.89, 0.84, 1])
      .setRoughnessFactor(0.82)
      .setMetallicFactor(0.02),
    sageStatus: withEmissive(
      doc
        .createMaterial('sageStatus')
        .setBaseColorFactor([0.26, 0.56, 0.42, 1])
        .setEmissiveFactor([0.22, 0.48, 0.36])
        .setRoughnessFactor(0.32)
        .setMetallicFactor(0.15),
      1.02,
    ),
    copperBeacon: withEmissive(
      doc
        .createMaterial('copperBeacon')
        .setBaseColorFactor([0.88, 0.49, 0.24, 1])
        .setEmissiveFactor([0.82, 0.45, 0.20])
        .setRoughnessFactor(0.26)
        .setMetallicFactor(0.15),
      1.12,
    ),
    screenWorkstation: createScreenMat('workstation-screen', screens['workstation-code-screen.png'], 0.68),
    screenUplanner: createScreenMat('uplanner-screen', screens['uplanner-etl-screen.png'], 0.68),
    screenGss: createScreenMat('gss-screen', screens['gss-mobile-screen.png'], 0.56),
    screenContactCv: createScreenMat('contact-cv-screen', screens['contact-cv-screen.png'], 0, true),
  };
}

function addArchitecturalPlinth(doc, scene, mats, prefix, radius, trimMat = 'satinCopper') {
  appendGeometryToDocument(
    doc,
    scene,
    mats,
    `${prefix}_base_lower`,
    new THREE.CylinderGeometry(radius, radius + 0.14, 0.14, 8),
    'basaltPlinth',
    { position: [0, 0.07, 0], rotation: [0, Math.PI / 8, 0] },
  );
  appendGeometryToDocument(
    doc,
    scene,
    mats,
    `${prefix}_base_inlay`,
    new THREE.CylinderGeometry(radius - 0.06, radius - 0.04, 0.03, 8),
    trimMat,
    { position: [0, 0.145, 0], rotation: [0, Math.PI / 8, 0] },
  );
  appendGeometryToDocument(
    doc,
    scene,
    mats,
    `${prefix}_deck`,
    new THREE.CylinderGeometry(radius - 0.1, radius - 0.08, 0.035, 8),
    'darkAnodized',
    { position: [0, 0.165, 0], rotation: [0, Math.PI / 8, 0] },
  );
}

function buildWorkstation(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'ws', 2.25, 'satinCopper');

  // Cantilevered architectural desk
  appendGeometryToDocument(doc, scene, mats, 'ws_desk_top', new THREE.BoxGeometry(2.58, 0.06, 1.18), 'basaltPlinth', { position: [0, 0.88, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_desk_trim', new THREE.BoxGeometry(2.6, 0.02, 1.2), 'satinCopper', { position: [0, 0.85, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_leg_l', new THREE.BoxGeometry(0.06, 0.7, 0.92), 'warmAluminum', { position: [-1.14, 0.51, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_leg_r', new THREE.BoxGeometry(0.06, 0.7, 0.92), 'warmAluminum', { position: [1.14, 0.51, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_crossbar', new THREE.BoxGeometry(2.26, 0.04, 0.05), 'darkAnodized', { position: [0, 0.34, -0.32] });

  // Desk mat & peripheral cluster
  appendGeometryToDocument(doc, scene, mats, 'ws_deskmat', new THREE.BoxGeometry(0.95, 0.008, 0.42), 'darkAnodized', { position: [-0.08, 0.914, 0.24] });
  appendGeometryToDocument(doc, scene, mats, 'ws_kb_case', new THREE.BoxGeometry(0.54, 0.024, 0.18), 'warmAluminum', { position: [-0.14, 0.928, 0.22] });
  appendGeometryToDocument(doc, scene, mats, 'ws_kb_keys', new THREE.BoxGeometry(0.5, 0.014, 0.15), 'warmPaper', { position: [-0.14, 0.942, 0.22] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mouse', new THREE.BoxGeometry(0.075, 0.028, 0.12), 'warmPaper', { position: [0.24, 0.928, 0.22] });

  // Dual articulated monitor post & ultrawide display
  appendGeometryToDocument(doc, scene, mats, 'ws_arm_post', new THREE.CylinderGeometry(0.032, 0.04, 0.48, 12), 'warmAluminum', { position: [-0.15, 1.14, -0.36] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_frame', new THREE.BoxGeometry(1.48, 0.78, 0.045), 'darkAnodized', { position: [-0.15, 1.4, -0.28] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_bezel', new THREE.BoxGeometry(1.5, 0.8, 0.018), 'warmAluminum', { position: [-0.15, 1.4, -0.3] });
  appendGeometryToDocument(doc, scene, mats, 'ws_mon_screen', new THREE.PlaneGeometry(1.42, 0.72), 'screenWorkstation', { position: [-0.15, 1.4, -0.255], flipUvY: true });

  // Secondary angled telemetry display
  appendGeometryToDocument(doc, scene, mats, 'ws_side_arm', new THREE.BoxGeometry(0.28, 0.035, 0.035), 'warmAluminum', { position: [0.56, 1.32, -0.28], rotation: [0, -0.35, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_side_frame', new THREE.BoxGeometry(0.7, 0.5, 0.04), 'darkAnodized', { position: [0.88, 1.34, -0.14], rotation: [0, -0.42, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ws_side_screen', new THREE.PlaneGeometry(0.64, 0.44), 'screenUplanner', { position: [0.87, 1.34, -0.118], rotation: [0, -0.42, 0], flipUvY: true });

  // SFF Workstation Chassis with ventilated grooves & single copper accent bar
  appendGeometryToDocument(doc, scene, mats, 'ws_pc_case', new THREE.BoxGeometry(0.32, 0.52, 0.52), 'darkAnodized', { position: [-1.02, 1.17, -0.16] });
  appendGeometryToDocument(doc, scene, mats, 'ws_pc_front', new THREE.BoxGeometry(0.28, 0.48, 0.02), 'warmAluminum', { position: [-1.02, 1.17, 0.1] });
  appendGeometryToDocument(doc, scene, mats, 'ws_pc_accent', new THREE.BoxGeometry(0.02, 0.36, 0.025), 'satinCopper', { position: [-0.88, 1.17, 0.1] });
}

function buildUplannerDatacenter(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'up', 1.85, 'warmAluminum');

  // 42U Server Cabinet with chamfered side columns and perforated shelf rails
  appendGeometryToDocument(doc, scene, mats, 'up_rack_body', new THREE.BoxGeometry(1.16, 2.34, 0.98), 'darkAnodized', { position: [0, 1.34, -0.14] });
  appendGeometryToDocument(doc, scene, mats, 'up_rack_crown', new THREE.BoxGeometry(1.24, 0.09, 1.06), 'warmAluminum', { position: [0, 2.54, -0.14] });
  appendGeometryToDocument(doc, scene, mats, 'up_rail_l', new THREE.BoxGeometry(0.05, 2.26, 0.05), 'warmAluminum', { position: [-0.55, 1.34, 0.36] });
  appendGeometryToDocument(doc, scene, mats, 'up_rail_r', new THREE.BoxGeometry(0.05, 2.26, 0.05), 'warmAluminum', { position: [0.55, 1.34, 0.36] });

  for (let i = 0; i < 6; i++) {
    const y = 0.52 + i * 0.31;
    appendGeometryToDocument(doc, scene, mats, `up_blade_${i}`, new THREE.BoxGeometry(0.98, 0.2, 0.05), 'basaltPlinth', { position: [0, y, 0.36] });
    appendGeometryToDocument(doc, scene, mats, `up_trim_${i}`, new THREE.BoxGeometry(0.92, 0.025, 0.02), 'warmAluminum', { position: [0, y + 0.04, 0.39] });
    appendGeometryToDocument(
      doc,
      scene,
      mats,
      `up_pip_${i}`,
      new THREE.BoxGeometry(0.08, 0.022, 0.02),
      i % 2 === 0 ? 'sageStatus' : 'satinCopper',
      { position: [0.38, y - 0.03, 0.39] },
    );
  }

  // Cantilevered ETL Inspection Console
  appendGeometryToDocument(doc, scene, mats, 'up_console_foot', new THREE.CylinderGeometry(0.18, 0.22, 0.05, 8), 'warmAluminum', { position: [-1.06, 0.2, 0.5] });
  appendGeometryToDocument(doc, scene, mats, 'up_console_post', new THREE.CylinderGeometry(0.042, 0.055, 0.98, 12), 'darkAnodized', { position: [-1.06, 0.7, 0.5] });
  appendGeometryToDocument(doc, scene, mats, 'up_console_frame', new THREE.BoxGeometry(1.08, 0.58, 0.045), 'warmAluminum', { position: [-1.06, 1.24, 0.5], rotation: [-0.22, 0.32, 0] });
  appendGeometryToDocument(doc, scene, mats, 'up_console_screen', new THREE.PlaneGeometry(1.0, 0.5), 'screenUplanner', { position: [-1.052, 1.244, 0.525], rotation: [-0.22, 0.32, 0], flipUvY: true });
}

function buildGssMobile(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'gss', 1.52, 'satinCopper');

  // Machined smartphone pedestal & chassis
  appendGeometryToDocument(doc, scene, mats, 'gss_pedestal_base', new THREE.CylinderGeometry(0.32, 0.42, 0.16, 8), 'warmAluminum', { position: [0, 0.26, 0] });
  appendGeometryToDocument(doc, scene, mats, 'gss_pedestal_stem', new THREE.BoxGeometry(0.22, 0.68, 0.16), 'darkAnodized', { position: [0, 0.64, -0.05] });

  const tilt = [-0.22, -0.2, 0];
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_body', new THREE.BoxGeometry(0.86, 1.66, 0.065), 'warmAluminum', { position: [0, 1.6, 0], rotation: tilt });
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_bezel', new THREE.BoxGeometry(0.8, 1.58, 0.02), 'darkAnodized', { position: [0, 1.6, 0.03], rotation: tilt });
  appendGeometryToDocument(doc, scene, mats, 'gss_phone_screen', new THREE.PlaneGeometry(0.74, 1.48), 'screenGss', { position: [-0.01, 1.602, 0.043], rotation: tilt, flipUvY: true });

  // Grounded Auth / REST / Sync physical hardware modules on brass risers
  const modules = [
    { name: 'gss_mod_auth', pos: [-0.95, 0.42, 0.15], busPos: [-0.48, 0.21, 0.08], rotY: -0.15, mat: 'satinCopper' },
    { name: 'gss_mod_rest', pos: [0.95, 0.42, 0.1], busPos: [0.48, 0.21, 0.05], rotY: 0.1, mat: 'warmAluminum' },
    { name: 'gss_mod_sync', pos: [0.58, 0.38, 0.78], busPos: [0.29, 0.21, 0.39], rotY: 0.85, mat: 'sageStatus' },
  ];
  for (const mod of modules) {
    appendGeometryToDocument(doc, scene, mats, `${mod.name}_bus`, new THREE.BoxGeometry(0.95, 0.03, 0.06), 'satinCopper', { position: mod.busPos, rotation: [0, mod.rotY, 0] });
    appendGeometryToDocument(doc, scene, mats, `${mod.name}_block`, new THREE.CylinderGeometry(0.18, 0.21, 0.38, 8), 'darkAnodized', { position: mod.pos });
    appendGeometryToDocument(doc, scene, mats, `${mod.name}_cap`, new THREE.CylinderGeometry(0.15, 0.18, 0.06, 8), mod.mat, { position: [mod.pos[0], mod.pos[1] + 0.22, mod.pos[2]] });
  }
}

function buildSkillsHub(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'sk', 2.2, 'satinCopper');

  // Four asymmetrical stepped monoliths for Software, Data, Cloud, AI
  const pillars = [
    { pos: [-1.18, 0.65], w: 0.44, h: 1.15, cap: 'satinCopper' },
    { pos: [1.18, 0.65], w: 0.46, h: 1.48, cap: 'warmAluminum' },
    { pos: [-1.18, -0.78], w: 0.48, h: 1.72, cap: 'sageStatus' },
    { pos: [1.18, -0.78], w: 0.42, h: 1.32, cap: 'satinCopper' },
  ];
  pillars.forEach((p, idx) => {
    appendGeometryToDocument(doc, scene, mats, `sk_pillar_${idx}`, new THREE.BoxGeometry(p.w, p.h, p.w), 'darkAnodized', { position: [p.pos[0], p.h * 0.5 + 0.18, p.pos[1]] });
    appendGeometryToDocument(doc, scene, mats, `sk_collar_${idx}`, new THREE.BoxGeometry(p.w + 0.06, 0.07, p.w + 0.06), p.cap, { position: [p.pos[0], p.h + 0.2, p.pos[1]] });
  });

  // Central tapered octagonal column with 6 horizontal brass chronological plates (2021-2026)
  appendGeometryToDocument(doc, scene, mats, 'sk_totem_core', new THREE.CylinderGeometry(0.24, 0.36, 2.05, 8), 'warmAluminum', { position: [0, 1.2, -0.05], rotation: [0, Math.PI / 8, 0] });
  for (let r = 0; r < 6; r++) {
    const rad = 0.44 - r * 0.024;
    appendGeometryToDocument(
      doc,
      scene,
      mats,
      `sk_cert_plate_${r}`,
      new THREE.CylinderGeometry(rad, rad, 0.05, 8),
      r === 5 ? 'copperBeacon' : 'satinCopper',
      { position: [0, 0.52 + r * 0.29, -0.05], rotation: [0, Math.PI / 8, 0] },
    );
  }
}

function buildProjectsStage(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'pr', 2.2, 'satinCopper');

  // Shared long gallery bench unifying Web3D + Data engineering pieces
  appendGeometryToDocument(doc, scene, mats, 'pr_bench', new THREE.BoxGeometry(3.2, 0.24, 1.28), 'basaltPlinth', { position: [0, 0.3, 0] });
  appendGeometryToDocument(doc, scene, mats, 'pr_bench_trim', new THREE.BoxGeometry(3.24, 0.03, 1.32), 'warmAluminum', { position: [0, 0.43, 0] });

  // Left: Web3D Precision Gimbal Sculpture (grounded frame + faceted icosahedron core)
  appendGeometryToDocument(doc, scene, mats, 'pr_gimbal_base', new THREE.BoxGeometry(0.72, 0.14, 0.72), 'darkAnodized', { position: [-0.88, 0.51, 0.04] });
  appendGeometryToDocument(doc, scene, mats, 'pr_gimbal_post_l', new THREE.BoxGeometry(0.06, 0.92, 0.08), 'warmAluminum', { position: [-1.2, 1.0, 0.04] });
  appendGeometryToDocument(doc, scene, mats, 'pr_gimbal_post_r', new THREE.BoxGeometry(0.06, 0.92, 0.08), 'warmAluminum', { position: [-0.56, 1.0, 0.04] });
  appendGeometryToDocument(doc, scene, mats, 'pr_gimbal_axle', new THREE.CylinderGeometry(0.025, 0.025, 0.7, 10), 'satinCopper', { position: [-0.88, 1.24, 0.04], rotation: [0, 0, Math.PI / 2] });
  appendGeometryToDocument(doc, scene, mats, 'pr_web3d_core', new THREE.IcosahedronGeometry(0.32, 0), 'warmPaper', { position: [-0.88, 1.24, 0.04] });

  // Right: 3-Stage Modular Data Manifold (Ingestion -> Polars -> API Exposure)
  appendGeometryToDocument(doc, scene, mats, 'pr_data_subbase', new THREE.BoxGeometry(0.92, 0.12, 0.72), 'darkAnodized', { position: [0.88, 0.5, -0.02] });
  appendGeometryToDocument(doc, scene, mats, 'pr_stage_1', new THREE.BoxGeometry(0.46, 0.28, 0.46), 'warmAluminum', { position: [0.88, 0.72, -0.02] });
  appendGeometryToDocument(doc, scene, mats, 'pr_pipe_1', new THREE.CylinderGeometry(0.07, 0.07, 0.2, 10), 'satinCopper', { position: [0.88, 0.96, -0.02] });
  appendGeometryToDocument(doc, scene, mats, 'pr_stage_2', new THREE.BoxGeometry(0.38, 0.26, 0.38), 'sageStatus', { position: [0.88, 1.18, -0.02] });
  appendGeometryToDocument(doc, scene, mats, 'pr_pipe_2', new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), 'satinCopper', { position: [0.88, 1.4, -0.02] });
  appendGeometryToDocument(doc, scene, mats, 'pr_stage_3', new THREE.BoxGeometry(0.32, 0.22, 0.32), 'darkAnodized', { position: [0.88, 1.6, -0.02] });
}

function buildContactBeacon(doc, scene, mats) {
  addArchitecturalPlinth(doc, scene, mats, 'ct', 1.85, 'satinCopper');

  // Architectural Desk + Angled Printed Resume Dossier Plate
  appendGeometryToDocument(doc, scene, mats, 'ct_lectern_base', new THREE.BoxGeometry(1.56, 0.72, 0.72), 'darkAnodized', { position: [0, 0.54, 0] });
  appendGeometryToDocument(doc, scene, mats, 'ct_lectern_trim', new THREE.BoxGeometry(1.6, 0.03, 0.76), 'warmAluminum', { position: [0, 0.91, 0] });

  const cvTilt = [-0.26, 0.12, 0];
  appendGeometryToDocument(doc, scene, mats, 'ct_cv_backing', new THREE.BoxGeometry(0.92, 1.22, 0.035), 'warmAluminum', { position: [-0.28, 1.54, 0.08], rotation: cvTilt });
  appendGeometryToDocument(doc, scene, mats, 'ct_cv_sheet', new THREE.PlaneGeometry(0.84, 1.16), 'screenContactCv', { position: [-0.275, 1.545, 0.101], rotation: cvTilt, flipUvY: true });

  // Machined Brass Resonator Mast & Warm Copper Beacon Lens
  appendGeometryToDocument(doc, scene, mats, 'ct_mast_collar', new THREE.CylinderGeometry(0.12, 0.16, 0.12, 8), 'satinCopper', { position: [0.56, 0.98, -0.08] });
  appendGeometryToDocument(doc, scene, mats, 'ct_mast_shaft', new THREE.CylinderGeometry(0.038, 0.05, 1.18, 12), 'warmAluminum', { position: [0.56, 1.62, -0.08] });
  appendGeometryToDocument(doc, scene, mats, 'ct_beacon_housing', new THREE.CylinderGeometry(0.11, 0.11, 0.1, 12), 'darkAnodized', { position: [0.56, 2.24, -0.08] });
  appendGeometryToDocument(doc, scene, mats, 'ct_beacon_lens', new THREE.CylinderGeometry(0.09, 0.09, 0.09, 12), 'copperBeacon', { position: [0.56, 2.33, -0.08] });
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
      resize: [2048, 2048],
      quality: 84,
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

async function generateStudioCubemap() {
  const cubemapDir = path.join(ROOT, 'public', 'cubemap', 'studio');
  fs.mkdirSync(cubemapDir, { recursive: true });

  const faces = {
    py: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <rect width="256" height="256" fill="#2A2723"/>
      <rect x="28" y="28" width="200" height="200" rx="18" fill="#FFF4E4" fill-opacity="0.88"/>
      <rect x="52" y="52" width="152" height="152" rx="10" fill="#FFFFFF"/>
    </svg>`,
    ny: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <rect width="256" height="256" fill="#141311"/>
      <rect x="16" y="16" width="224" height="224" fill="#1C1A17"/>
    </svg>`,
    px: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#36322C"/>
          <stop offset="55%" stop-color="#22201C"/>
          <stop offset="100%" stop-color="#141311"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#g)"/>
      <rect x="20" y="36" width="216" height="28" rx="4" fill="#F5E6D3" fill-opacity="0.65"/>
      <rect x="40" y="116" width="176" height="6" fill="#EB8647" fill-opacity="0.45"/>
    </svg>`,
    nx: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#33373E"/>
          <stop offset="55%" stop-color="#202226"/>
          <stop offset="100%" stop-color="#141311"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#g)"/>
      <rect x="24" y="42" width="208" height="24" rx="4" fill="#DCE4EE" fill-opacity="0.58"/>
    </svg>`,
    pz: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#35312B"/>
          <stop offset="60%" stop-color="#1E1C19"/>
          <stop offset="100%" stop-color="#141311"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#g)"/>
      <rect x="32" y="34" width="192" height="22" rx="4" fill="#F3EFE6" fill-opacity="0.52"/>
    </svg>`,
    nz: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2F2C27"/>
          <stop offset="60%" stop-color="#1B1A17"/>
          <stop offset="100%" stop-color="#141311"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#g)"/>
      <rect x="48" y="44" width="160" height="18" rx="4" fill="#E8D7C3" fill-opacity="0.44"/>
    </svg>`,
  };

  for (const [name, svg] of Object.entries(faces)) {
    await sharp(Buffer.from(svg)).png().toFile(path.join(cubemapDir, `${name}.png`));
  }
  console.log('[cubemap] Generated 6-face architectural studio cubemap in public/cubemap/studio/');
}

async function generateFloorStonePbr() {
  const size = 512;
  const albedoRaw = Buffer.alloc(size * size * 4);
  const roughRaw = Buffer.alloc(size * size * 4);
  const normalRaw = Buffer.alloc(size * size * 4);
  const aoRaw = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    const tileY = y % 128;
    const mortarY = tileY < 3 || tileY > 125;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const tileX = x % 128;
      const mortarX = tileX < 3 || tileX > 125;
      const isJoint = mortarX || mortarY;

      const wave =
        Math.sin(x * 0.045 + y * 0.02) * 5 +
        Math.cos(x * 0.11 - y * 0.09) * 3 +
        Math.sin((x + y) * 0.23) * 2;

      const val = isJoint ? 168 : Math.max(175, Math.min(242, Math.round(212 + wave)));
      albedoRaw[idx] = val;
      albedoRaw[idx + 1] = val - 3;
      albedoRaw[idx + 2] = val - 8;
      albedoRaw[idx + 3] = 255;

      const rVal = isJoint ? 228 : Math.max(135, Math.min(215, Math.round(176 - wave * 1.6)));
      roughRaw[idx] = rVal;
      roughRaw[idx + 1] = rVal;
      roughRaw[idx + 2] = rVal;
      roughRaw[idx + 3] = 255;

      const nx = isJoint ? (mortarX ? 108 : 128) : Math.round(128 + Math.cos(x * 0.15) * 7);
      const ny = isJoint ? (mortarY ? 108 : 128) : Math.round(128 + Math.sin(y * 0.15) * 7);
      normalRaw[idx] = nx;
      normalRaw[idx + 1] = ny;
      normalRaw[idx + 2] = 250;
      normalRaw[idx + 3] = 255;

      const ao = isJoint ? 132 : Math.round(224 + Math.sin(x * 0.05) * 10);
      aoRaw[idx] = ao;
      aoRaw[idx + 1] = ao;
      aoRaw[idx + 2] = ao;
      aoRaw[idx + 3] = 255;
    }
  }

  await sharp(albedoRaw, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 86 })
    .toFile(path.join(PBR_DIR, 'stone-albedo.webp'));
  await sharp(roughRaw, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 86 })
    .toFile(path.join(PBR_DIR, 'stone-roughness.webp'));
  await sharp(normalRaw, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 86 })
    .toFile(path.join(PBR_DIR, 'stone-normal.webp'));
  await sharp(aoRaw, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 86 })
    .toFile(path.join(PBR_DIR, 'stone-ao.webp'));

  console.log('[pbr] Generated 512x512 honed stone floor PBR maps (WebP)');
}

async function generateOgCoverCard() {
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#11100E"/>
    <rect x="44" y="44" width="1112" height="542" rx="10" fill="#161513" stroke="#34312B" stroke-width="2"/>
    <rect x="44" y="44" width="1112" height="6" fill="#EB8647"/>

    <text x="96" y="132" fill="#EB8647" font-family="monospace" font-size="18" font-weight="600">PORTAFOLIO INTERACTIVO WEB 3D · CALI, COLOMBIA</text>
    <text x="96" y="218" fill="#F3EFE6" font-family="Georgia, serif" font-size="64" font-weight="600">Junior Orlando Cantor Arévalo</text>
    <text x="96" y="274" fill="#B5AFA4" font-family="sans-serif" font-size="28">Ingeniería de Sistemas · Software Full-Stack, Ingeniería de Datos y WebGL2</text>

    <line x1="96" y1="318" x2="1104" y2="318" stroke="#34312B" stroke-width="2"/>

    <g transform="translate(96, 356)">
      <rect width="312" height="124" rx="6" fill="#1E1D1A" stroke="#34312B" stroke-width="2"/>
      <text x="24" y="42" fill="#EB8647" font-family="monospace" font-size="15">01 EXPERIENCIA EN DATOS</text>
      <text x="24" y="76" fill="#F3EFE6" font-family="sans-serif" font-size="22" font-weight="600">Uplanner</text>
      <text x="24" y="104" fill="#B5AFA4" font-family="monospace" font-size="15">Airflow · Polars · Streamlit</text>
    </g>

    <g transform="translate(444, 356)">
      <rect width="312" height="124" rx="6" fill="#1E1D1A" stroke="#34312B" stroke-width="2"/>
      <text x="24" y="42" fill="#5CB88D" font-family="monospace" font-size="15">02 DESARROLLO MÓVIL Y REST</text>
      <text x="24" y="76" fill="#F3EFE6" font-family="sans-serif" font-size="22" font-weight="600">Global System Solutions</text>
      <text x="24" y="104" fill="#B5AFA4" font-family="monospace" font-size="15">APIs REST · Auth · Producción</text>
    </g>

    <g transform="translate(792, 356)">
      <rect width="312" height="124" rx="6" fill="#1E1D1A" stroke="#34312B" stroke-width="2"/>
      <text x="24" y="42" fill="#EB8647" font-family="monospace" font-size="15">03 FORMACIÓN Y ARQUITECTURA</text>
      <text x="24" y="76" fill="#F3EFE6" font-family="sans-serif" font-size="22" font-weight="600">Universidad del Valle</text>
      <text x="24" y="104" fill="#B5AFA4" font-family="monospace" font-size="15">React · Three.js · AWS · GCP</text>
    </g>

    <text x="96" y="542" fill="#B5AFA4" font-family="monospace" font-size="17">linkedin.com/in/junior-cantor-arevalo · github.com/cantor11 · junior.cantor11@gmail.com</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(ROOT, 'public', 'og-cover.png'));
  console.log('[seo] Generated 1200x630 Open Graph cover at public/og-cover.png');
}

async function main() {
  copyDracoDecoders();
  await generateStudioCubemap();
  await generateFloorStonePbr();
  await generateOgCoverCard();
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
