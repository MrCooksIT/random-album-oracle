import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/random-album-oracle/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure asset file names are consistent
    rollupOptions: {
      output: {
        // Use a more predictable naming pattern for assets
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      }
    }
  }
})