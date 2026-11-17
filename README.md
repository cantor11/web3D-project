# Portafolio Web 3D Interactivo — Junior Orlando Cantor Arévalo

Implementación hasta **Sprint 2** del proyecto Jira `portafolioWeb3D` (`PW3D-7` a `PW3D-12`) utilizando React 18, TypeScript estricto, Three.js, React Three Fiber, Drei, Postprocessing, GSAP y Zustand.

## Arquitectura del Proyecto

- `src/pages/portfolio/`: Orquestador principal (`PortfolioPage.tsx`) separado en `controls/` (`CameraRig.tsx`), `lights/` (`PortfolioLights.tsx`), `staging/` (`PortfolioStaging.tsx`), `postprocessing/` (`PortfolioPostProcessing.tsx`) y `world/` (`AboutStation.tsx`, `ExperienceDiorama.tsx`, `SkillsStation.tsx`, `ProjectsStation.tsx`, `ContactStation.tsx`).
- `src/components/canvas/`: Configuración del lienzo WebGL2 (`SceneCanvas.tsx`), cargador DRACO (`GlbModel.tsx`, `modelPreload.ts`) y nodos interactivos (`InteractiveNode.tsx`).
- `src/components/hud/` y `src/components/modals/`: HUD bilingüe ES/EN (`TopNavHUD.tsx`, `BottomTelemetryHUD.tsx`), overlay de carga (`LoadingOverlay.tsx`) y tarjetas 2.5D accesibles sobre `<dialog>` nativo (`DetailDialog25D.tsx`).
- `src/shaders/`: Shaders GLSL nativos (`blueprintGrid.vert/.frag`, `etlPulse.vert/.frag`) importados con `vite-plugin-glsl`.
- `src/stores/` y `src/data/`: Estado global con Zustand (`usePortfolioStore.ts`) sincronizado con History API y datos reales de la hoja de vida (`portfolioData.ts`).
- `scripts/build-assets.mjs`: Generación reproducible de maquetas low-poly con mapas PBR (`Normal`, `Roughness`, `AO`), compresión DRACO y texturas WebP vía `@gltf-transform/functions`.

## Comandos

```bash
npm install
npm run assets:build
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Trazabilidad Jira (Sprints 1 y 2)

- `PW3D-7`: Pipeline Vite + React 18 + TypeScript estricto, WebGL2 (`SRGBColorSpace`, `ACESFilmicToneMapping`), DPR `[1, 2]`, resize debounced `<= 16ms`, soporte `.glsl`/`.vert`/`.frag`.
- `PW3D-8`: `OrbitControls` con `polarAngle` entre `15°` y `85°`, `dampingFactor: 0.05`, iluminación PBR + sombras soft PCF + `Environment` HDR procedural.
- `PW3D-9`: Cámara cinemática GSAP (`1.8s`, `power3.inOut`), resolución limpia de clics concurrentes, History API (`#sobre-mi`..`#contacto`) y atajos `1`–`5` y `←`/`→`.
- `PW3D-10`: Raycasting filtrado por `THREE.Layers` (`INTERACTIVE_LAYER = 1`), outline cian selectivo, escala suave `+5%` y cursor `pointer`.
- `PW3D-11`: Diorama interactivo de experiencia laboral en **Uplanner** (rack + pulsos ETL Airflow/Polars) y **Global System Solutions** (mockup móvil + nodos API REST) con fichas 2.5D.
- `PW3D-12`: Modelos `.glb` `< 18,000` triángulos por estación, optimizados con DRACO + WebP (`> 95%` de compresión) y decoder local en `public/draco/`.

## Reemplazo Opcional de Modelos Blender

Los `.glb` en `public/models-3d/` son funcionales y validados con `gltf-transform`. Si se requiere sustituirlos por modelos esculpidos manualmente en Blender (`.blend` fuente):

- `public/models-3d/workstation.glb` (`<= 18,000` tris)
- `public/models-3d/uplanner-datacenter.glb` (`<= 18,000` tris)
- `public/models-3d/gss-mobile.glb` (`<= 18,000` tris)
- `public/models-3d/skills-hub.glb` (`<= 18,000` tris)
- `public/models-3d/projects-stage.glb` (`<= 18,000` tris)
- `public/models-3d/contact-beacon.glb` (`<= 18,000` tris)
