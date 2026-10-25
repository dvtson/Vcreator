import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
// @ts-expect-error Local server module is JavaScript; never included in browser output.
import { previewDevPlugin } from './server/preview-dev.mjs'

export default defineConfig(({ mode }) => ({
  plugins: [react(), previewDevPlugin(loadEnv(mode, process.cwd(), 'VITE_'))],
  server: {
    strictPort: true,
    watch: { ignored: ['**/artifacts/**'] },
  },
}))
