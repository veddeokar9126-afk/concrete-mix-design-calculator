// Vite config for the presentation deck only. The calculator's own
// vite.config.js at the repo root is untouched.
//
//   npm run present          dev server at http://localhost:5180
//   npm run present:build    one self-contained HTML file in presentation/dist/
//                            (opens from file:// or any static host, fully offline)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  base: './',
  plugins: [react(), viteSingleFile()],
  server: {
    port: 5180,
    open: true,
    fs: { allow: [path.resolve(here, '..')] },
  },
  preview: { port: 5181 },
  build: {
    outDir: path.resolve(here, 'dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,
  },
});
