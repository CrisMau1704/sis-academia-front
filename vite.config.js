import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // CONFIGURACIÓN CRÍTICA PARA VERCEL
  base: '/', // Esto es importante para rutas correctas
  build: {
    outDir: 'dist', // Carpeta donde se generan los archivos de producción
    emptyOutDir: true, // Limpia la carpeta en cada build
    sourcemap: false, // Desactiva sourcemaps para producción
    rollupOptions: {
      input: {
        main: './index.html' // Especifica el punto de entrada
      },
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // Optimización para producción
  server: {
    port: 5173
  }
})