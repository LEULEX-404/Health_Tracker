import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://health-tracker-y6v2.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
