import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula el navegador
    globals: true, // Permite usar describe, it, expect sin importarlos
    setupFiles: ['./src/setupTests.js'], // Archivo de configuración previa
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'], // Genera reportes visuales
    },
  },
})