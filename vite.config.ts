import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), splitVendorChunkPlugin()],
  base: '/web-pixel-maker/',
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
