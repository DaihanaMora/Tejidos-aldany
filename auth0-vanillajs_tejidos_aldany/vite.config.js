import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './src/pages/dashboard.html',
        completarPerfil: './src/pages/completar-perfil.html',
      }
    }
  }
})