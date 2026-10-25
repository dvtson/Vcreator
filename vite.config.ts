import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
// @ts-expect-error Local server module is JavaScript; never included in browser output.
import { previewDevPlugin } from './server/preview-dev.mjs'

export default defineConfig(({ mode, isSsrBuild }) => ({
  plugins: [react(), previewDevPlugin(loadEnv(mode, process.cwd(), 'VITE_')), ...(isSsrBuild ? [{
    name:'public-render-only', enforce:'pre' as const,
    transform(_code:string,id:string){
      if(id.endsWith('/src/context/DataContext.tsx'))return "export {useData,PublicRenderProvider} from '../server/PublicContext';";
      if(id.endsWith('/src/hooks/useAuth.ts'))return "export function useAuth(){return {user:null,ready:true,error:''};}";
      if(id.endsWith('/src/services/authService.ts'))return "export function isAuthenticated(){return false;}";
    },
  }] : [])],
  ssr: { noExternal: true },
  ...(isSsrBuild ? {build:{rollupOptions:{output:{entryFileNames:'renderHome.mjs'}}}} : {}),
  server: {
    strictPort: true,
    watch: { ignored: ['**/artifacts/**'] },
  },
}))
