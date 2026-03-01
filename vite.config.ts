import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Empêcher Vite de masquer l'origin pour Tauri
  server: {
    strictPort: true,
  },
  // Pas de hash dans les noms de fichiers pour Tauri
  clearScreen: false,
})
