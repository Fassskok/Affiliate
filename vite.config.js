import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/Affiliate/',
  plugins: [vue()],

  server: {
    proxy: {
      '/api': {
        target: 'http://affiliate.yanbasok.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
