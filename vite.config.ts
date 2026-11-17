import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    glsl({
      include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
      defaultExtension: 'glsl',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core';
          if (
            id.includes('node_modules/@react-three/') ||
            id.includes('node_modules/postprocessing/')
          ) {
            return 'r3f-ecosystem';
          }
          if (id.includes('node_modules/gsap/')) return 'gsap-motion';
          return undefined;
        },
      },
    },
  },
});
